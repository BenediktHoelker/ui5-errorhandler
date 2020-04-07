sap.ui.define([
	"errorhandler/library/handling/BaseHandling",
	"sap/ui/core/library",
	"errorhandler/library/handling/MessagePopover",
	"errorhandler/library/handling/ServiceError",
	"errorhandler/library/handling/SpecialMessages"
], function(BaseHandling, library, MessagePopoverHandling, ServiceErrHandling, SpecialMsgHandling) {
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

		init: function({
			appViewModel,
			oDataModels
		}) {
			this.removeAllMessages();
			this._initializeErrorHandling(oDataModels, appViewModel);
		},

		initForReuseComp: function({
			componentVM,
			oDataModels
		}) {
			this._initializeErrorHandling(oDataModels, componentVM);
		},

		_initializeErrorHandling: function(aODataModels, oViewModel) {
			aODataModels.forEach(oODataModel => {
				Promise.all([this._waitForAppToBeRendered(oViewModel), this._onMetadataFailed(oODataModel)])
					.then(() => {
						oViewModel.setProperty("/busy", false);

						this._getServiceErrHandling().showError({
							appUseable: false,
							error: this._getBaseHandling().getResBundle().getText("metadataLoadingFailed")
						});
					});

				oODataModel.attachMessageChange(oEvent => {
					this._addedBcknMsgs = this._getNewBckndMsgs(oEvent);

					const oError = this._addedBcknMsgs.find(message => message.getType() === "Error");
					if (oError) {
						this._getServiceErrHandling().showError({
							error: oError
						});
					}
				});

				oODataModel.attachRequestFailed(oEvent => {
					// falls der Request fehlschlägt, jedoch keine Message geliefert wurde trat ein Timeout bzw. Verbindungsabbruch auf
					if (this._addedBcknMsgs.length === 0) {
						this._showConnectionError(oEvent);
					}
				});
			});
		},

		_waitForAppToBeRendered: function(oViewModel) {
			if (oViewModel.getProperty("/isRendered")) {
				return Promise.resolve();
			}

			return new Promise(resolve =>
				oViewModel.attachPropertyChange(() => {
					if (oViewModel.getProperty("/isRendered")) {
						resolve();
					}
				})
			);
		},

		_onMetadataFailed: function(oODataModel) {
			if (oODataModel.isMetadataLoadingFailed()) {
				return Promise.resolve();
			}

			return new Promise(resolve =>
				oODataModel.attachMetadataFailed(() => resolve())
			);
		},

		_getNewBckndMsgs: function(oEvent) {
			const aNewMsgs = oEvent.getParameter("newMessages") || [];
			if (aNewMsgs.length === 0) {
				return aNewMsgs;
			}

			// Dublikate entfernen
			const aUniqueMsgs = this._getUniqueMsgs(aNewMsgs);

			const aDuplicates = aNewMsgs.filter(oMsg => !aUniqueMsgs.includes(oMsg));
			this._getBaseHandling().getMessageManager().removeMessages(aDuplicates)

			return aUniqueMsgs;
		},

		_getUniqueMsgs: function(aMessages) {
			const aUniqueMsgs = [];
			aMessages.forEach(msg => {
				if (!aUniqueMsgs.some(uniqueMsg => uniqueMsg.target === msg.target &&
						(uniqueMsg.message.includes(msg.message) || msg.message.includes(uniqueMsg.message)))) {
					aUniqueMsgs.push(oMsg);
				}
			});
			return aUniqueMsgs;
		},

		_showConnectionError: function(oEvent) {
			const oServiceErrHandling = this._getServiceErrHandling();
			const oResponse = oEvent.getParameter("response");
			const sResponseText = oResponse.responseText;

			if (sResponseText.includes("Timed Out") || oResponse.statusCode === 504) {
				return oServiceErrHandling.showError({
					error: this._getBaseHandling().getResBundle().getText("timedOut")
				});
			}

			oServiceErrHandling.showError({
				error: sResponseText
			});
		},

		_getServiceErrHandling: function() {
			if (!this._oServiceErrHandling) {
				this._oServiceErrHandling = new ServiceErrHandling();
			}
			return this._oServiceErrHandling;
		},

		/////////////////////////////////////////////////////////////////
		// Message Popover
		/////////////////////////////////////////////////////////////////

		getMessagePopover: function() {
			return this._getMsgPopoverHandling().getMessagePopover();
		},

		_getMsgPopoverHandling: function() {
			if (!this._oMsgPopoverHandling) {
				this._oMsgPopoverHandling = new MessagePopoverHandling();
			}
			return this._oMsgPopoverHandling;
		},

		removeMessagePopoverError: function() {
			// obsolet (nur für Kompatibilität mit 'alten' Apps)
		},

		/////////////////////////////////////////////////////////////////
		// Basics
		/////////////////////////////////////////////////////////////////

		setMessageManager: function(oView) {
			this._getBaseHandling().getMessageManager().registerObject(oView, true);
		},

		getMessageModel: function() {
			return this._getBaseHandling().getMessageModel()
		},

		removeAllMessages: function() {
			this._getBaseHandling().getMessageManager().removeAllMessages();
		},

		_getBaseHandling: function() {
			if (!this._oBaseHandling) {
				this._oBaseHandling = new BaseHandling();
			}
			return this._oBaseHandling;
		},

		/////////////////////////////////////////////////////////////////
		// Special-Messages => manuelles Hinzufügen und Löschen
		/////////////////////////////////////////////////////////////////

		addResourceNotFoundMessage: function(oInput, sMessage) {
			this._getSpecialMsgHandling().addValidationMsg({
				input: oInput,
				text: sMessage
			});
		},

		addManualValidationMessage: function(oInput, sMessage) {
			this._getSpecialMsgHandling().addValidationMsg({
				input: oInput,
				text: sMessage
			});
		},

		removeManualValidationMessage: function(oInput) {
			this._getSpecialMsgHandling().removeValidationMsg(oInput);
		},

		addManualMessage: function(oParams) {
			this._getSpecialMsgHandling().addManualMessage(oParams);
		},

		removeManualMessage: function(sTarget) {
			this._getSpecialMsgHandling().removeMsgsWithTarget(sTarget);
		},

		removeMessagesWithTarget: function(sTarget) {
			this._getSpecialMsgHandling().removeMsgsWithTarget(sTarget);
		},

		removeBckndMsgForControl: function(oInput) {
			this._getSpecialMsgHandling().removeBckndMsgForControl(oInput);
		},

		hasMessageWithTarget: function(sTarget) {
			return this._getSpecialMsgHandling().hasMsgWithTarget(sTarget);
		},

		_getSpecialMsgHandling: function() {
			if (!this._SpecialMsgHandling) {
				this._SpecialMsgHandling = new SpecialMsgHandling();
			}
			return this._SpecialMsgHandling;
		},

	};

}, /* bExport= */ false);