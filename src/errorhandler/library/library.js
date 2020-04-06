sap.ui.define([
	"sap/ui/core/library",
	"errorhandler/library/MessagePopoverFunctions",
	"sap/ui/model/resource/ResourceModel",
	"errorhandler/library/ServiceError",
	"errorhandler/library/SpecialMessageUse"
], function(library, MessagePopoverFunctions, ResourceModel, ServiceError, SpecialMessageUse) {
	"use strict";
	sap.ui.getCore().initLibrary({
		name: "errorhandler.library",
		version: "1.0.0",
		dependencies: ["sap.ui.core"],
		noLibraryCSS: true,
		types: [],
		interfaces: [],
		controls: [],
		elements: []
	});

	return {

		init: function(oModels) {
			this._aODataModels = oModels.oDataModels;
			this._oAppVM = oModels.appViewModel;
			this._oMessageModel = sap.ui.getCore().getMessageManager().getMessageModel();

			MessagePopoverFunctions.init(this);
			SpecialMessageUse.init(this);
			ServiceError.init(this);

			this._initializeErrorHandling();
		},

		_getResBundle: function() {
			if (!this._oResBundle) {
				const oResourceModel = new ResourceModel({
					bundleName: "errorhandler.library.i18n.i18n"
				});
				this._oResBundle = oResourceModel.getResourceBundle();
			}
			return this._oResBundle;
		},

		_getODataModels: function() {
			return this._aODataModels;
		},

		_initializeErrorHandling: function() {
			this.removeAllMessages();
			const aODataModels = this._getODataModels();

			aODataModels.forEach(oODataModel => {
				Promise.all([this._onMetadataFailed(oODataModel), this._waitForAppToBeRendered()])
					.then(values => {
						this._oAppVM.setProperty("/busy", false);

						const oMetadataFailedError = ServiceError.createError(this._getResBundle().getText("metadataLoadingFailed"));
						ServiceError.showAppNotUseableError(oMetadataFailedError);
					});

				oODataModel.attachMessageChange(oEvent => {
					const aNewBckndMsgs = this._getNewBckndMsgs(oEvent);
					const oError = aNewBckndMsgs.find(oMessage => oMessage.getType() === "Error");
					if (oError) {
						ServiceError.showError(oError);
					}
					this._addedBcknMsgs = aNewBckndMsgs;
				});

				oODataModel.attachRequestFailed(oEvent => {
					// falls der Request fehlschlägt, jedoch keine Message geliefert wurde trat ein Timeout bzw. Verbindungsabbruch auf
					if (this._addedBcknMsgs.length === 0) {
						this._showConnectionError(oEvent);
					}
				});
			});

		},

		_waitForAppToBeRendered: function() {
			if (this._oAppVM.getProperty("/isRendered")) {
				return Promise.resolve();
			}

			return new Promise(resolve => {
				this._oAppVM.attachPropertyChange(() => {
					if (this._oAppVM.getProperty("/isRendered")) {
						resolve();
					}
				});
			});
		},

		_onMetadataFailed: function(oODataModel) {
			return new Promise(resolve => {
				if (oODataModel.isMetadataLoadingFailed()) {
					resolve({
						message: this._getResBundle().getText("metadataLoadingFailed")
					});
				}

				oODataModel.attachMetadataFailed(oEvent => {
					resolve(oEvent.getParameter("response"));
				});
			});
		},

		_getNewBckndMsgs: function(oEvent) {
			const aNewBckndMsgs = oEvent.getParameter("newMessages") || [];
			if (aNewBckndMsgs.length === 0) {
				return aNewBckndMsgs;
			}

			const aUniqueMessages = this._getUniqueMessages(aNewBckndMsgs);
			this._removeDuplicateMsgs(aNewBckndMsgs, aUniqueMessages);

			return aUniqueMessages;
		},

		_getUniqueMessages: function(aAllMessages) {
			const aUniqueMessages = [];
			aAllMessages.forEach(oMsg => {
				const bIsDuplicate = aUniqueMessages.some(oUniqueMsg => {
					const bSameTarget = oMsg.target === oUniqueMsg.target;
					const bSameMessage = oMsg.message.includes(oUniqueMsg.message) || oUniqueMsg.message.includes(oMsg.message);
					return bSameTarget && bSameMessage;
				});
				if (!bIsDuplicate) {
					aUniqueMessages.push(oMsg);
				}
			});
			return aUniqueMessages;
		},

		_removeDuplicateMsgs: function(aAllMessages, aUniqueMessages) {
			let aDuplicates = aAllMessages.filter(oMsg => {
				return !aUniqueMessages.includes(oMsg);
			});

			sap.ui.getCore().getMessageManager().removeMessages(aDuplicates);
		},

		_showConnectionError: function(oEvent) {
			const oResponse = oEvent.getParameter("response");
			const sResponseText = oResponse.responseText;
			const bIsTimeout = sResponseText.includes("Timed Out") || oResponse.statusCode === 504;
			if (bIsTimeout) {
				const oTimedOutError = ServiceError.createError(this._getResBundle().getText("timedOut"));
				ServiceError.showError(oTimedOutError);
			} else {
				const oError = ServiceError.createError(sResponseText);
				ServiceError.showError(oError);
			}
		},

		getMessageModel: function() {
			return this._oMessageModel;
		},

		/*
		 * Entfernt nach einmaligem Aufruf immer folgende Fehlermeldung:
		 * Popover-dbg.js:1235 Uncaught TypeError: Cannot read property 'top' of undefined at f.g._calcVertical (Popover-dbg.js:1235) ...
		 *
		 * Dieser Fehler tritt sonst immer dann auf, wenn der MessagePopover geöffnet ist, die letzte Message entfernt wird, und
		 * der MessagePopoverButton unsichtbar wird.
		 */
		removeMessagePopoverError: function(oMessagePopoverOptions) {
			MessagePopoverFunctions.removeMessagePopoverError(oMessagePopoverOptions.messagePopoverButton, oMessagePopoverOptions.messagePopover);
		},

		/*
		 * Methode muss in der onInit jeder View in der der MessagePopover verwendet wird aufgerufen werden,
		 * um das automatische Aktualisieren der Messages zu aktivieren. 
		 */
		setMessageManager: function(oView) {
			sap.ui.getCore().getMessageManager().registerObject(oView, true);
		},

		getMessagePopover: function() {
			return MessagePopoverFunctions.getMessagePopover();
		},

		/*
		 * Methode zum Entfernen alle Messages (Manuelle, Backend, Validierung, ...). 
		 */
		removeAllMessages: function() {
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},

		/*
		 * Methode kann genutzt werden um einen Error darzustellen, falls bspw.:
		 *	- in einer ComboBox kein gültiger Wert angegeben wurde
		 *  - in einem SmartField mit ValueHelp ein ungültiger Wert angegeben wurde
		 */
		addResourceNotFoundMessage: function(oInput, sMessage) {
			SpecialMessageUse.addResourceNotFoundMessage(oInput, sMessage);
		},

		/*
		 * Methode kann genutzt werden um einen Error darzustellen, falls bspw.:
		 *	- mindestens eins von drei Eingabefelder ausgefüllt sein muss, alle Eingaben aber entfernt wurden
		 */
		addManualValidationMessage: function(oInput, sMessage) {
			SpecialMessageUse.addManualValidationMessage(oInput, sMessage);
		},

		/*
		 * Methode kann genutzt werden um einen mit addManualValidationMessage erstellten Fehler zu entfernen, falls bspw.:
		 *	- mindestens eins von drei Eingabefelder ausgefüllt sein muss, und dies der Fall wurde
		 */
		removeManualValidationMessage: function(oInput) {
			SpecialMessageUse.removeManualValidationMessage(oInput);
		},

		/*
		 * Methode kann genutzt werden um eine manuelle Message hinzuzufügen.
		 *	Bspw. falls alle Items einer Tabelle vom Benutzer entfernt wurden.
		 */
		addManualMessage: function(oMessageDetails) {
			SpecialMessageUse.addManualMessage(oMessageDetails);
		},

		/*
		 * Methode kann genutzt werden um eine manuell angelegt Message zu löschen.
		 */
		removeManualMessage: function(sTarget) {
			SpecialMessageUse.removeManualMessage(sTarget);
		},

		/*
		 * Methode kann genutzt werden um Backend-Messages mit einem bestimmten Target zu entfernen.
		 * Bspw. eine Backend-Validierung umfasst mehrere Eingaben, die Message teilt das Ergebnis der Validierung mit
		 * anschließend wird ein der Eingaben bearbeitet => Message soll gelöscht werden, da nicht mehr aktuell
		 */
		removeMessagesWithTarget: function(sTarget) {
			SpecialMessageUse.removeMessagesWithTarget(sTarget);
		},

		/*
		 * Methode kann genutzt werden um Backend-Messages eines Controls zu entfernen.
		 * Backend-Messages werden nicht automatisch entfernt wenn das Binding geändert wird.
		 */
		removeBckndMsgForControl: function(oInput) {
			SpecialMessageUse.removeBckndMsgForControl(oInput);
		},

		hasMessageWithTarget: function(sTarget) {
			return SpecialMessageUse.hasMessageWithTarget(sTarget);
		}

	};

}, /* bExport= */ false);