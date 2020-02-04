sap.ui.define([
	"sap/m/Button",
	"sap/m/MessagePopover"
], function (Button, MessagePopover) {
	"use strict";

	return {

		init: function (oLibrary) {
			this._oLibrary = oLibrary;
			this._oMessagePopover = this._createMessagePopover();

			return this;
		},

		_createMessagePopover: function () {
			const oMessagePopover = new MessagePopover({
				headerButton: new Button({
					text: this._oLibrary._getResBundle().getText("sendMail"),
					press: () => {
						this._createEmailForMessages(this);
					}
				}),
				items: {
					path: "message>/",
					template: sap.ui.xmlfragment("errorhandler.library.MessageItem", this)
				}
			});
			oMessagePopover.setModel(this._oLibrary.getMessageModel(), "message");
			return oMessagePopover;
		},

		removeMessagePopoverError: function (oMessagePopoverButton, oMessagePopover) {
			const fnRemove = () => {
				oMessagePopoverButton.getBinding("visible").attachChange(oEvent => {
					const bMessagesSet = sap.ui.getCore().getMessageManager().getMessageModel().getData().length > 0;
					if (!bMessagesSet && oMessagePopover.isOpen()) {
						oMessagePopover.close();
					}
				});
			};

			const oBinding = oMessagePopoverButton.getBinding("visible");
			if (oBinding) {
				fnRemove();
				return;
			}

			oMessagePopoverButton.attachEventOnce("modelContextChange", fnRemove);
		},

		getMessagePopover: function () {
			return this._oMessagePopover;
		},

		_createEmailForMessages: function () {
			// Email-Betreff	
			const sAppName = sap.ushell.services.AppConfiguration.getCurrentApplication().ui5ComponentName;
			const sSubject = this._oLibrary._getResBundle().getText("mailTitle", sAppName);

			// Email-Inhalt	
			const oCurrentApp = sap.ushell.Container.getService("AppLifeCycle").getCurrentApplication();
			const oCurrentAppComponent = oCurrentApp.componentInstance;
			const oUserModel = oCurrentAppComponent.getModel("user");
			const sUserInformation = this._getUserInformationsForEmail(oUserModel);

			const sMessageInformations = this._getMessageInformationsForEmail();
			const sBody = sUserInformation + sMessageInformations;

			// Email-Adresse
			const sEmailAddress = this._oLibrary._getResBundle().getText("mailAddress");

			sap.m.URLHelper.triggerEmail(sEmailAddress, sSubject, sBody);
		},

		_getUserInformationsForEmail: function (oUserModel) {
			let sUserInformations;
			// falls das UserModel genutzt wird sollen die Daten des aktuellen Benutzers ausgelesen werden
			// ansonsten wird der User aus der Shell ermittelt
			if (oUserModel && oUserModel.getProperty("/user")) {
				const oUserData = oUserModel.getProperty("/user");
				sUserInformations = this._oLibrary._getResBundle().getText("userInformationLong", [oUserData.PersonalFullName, oUserData.UserName,
					oUserData.PlantName,
					oUserData.Plant
				]);
			} else {
				const sUserId = sap.ushell.Container.getService("UserInfo").getId();
				sUserInformations = this._oLibrary._getResBundle().getText("userInformationShort", sUserId);
			}
			return sUserInformations;
		},

		_getMessageInformationsForEmail: function () {
			const aAllMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData();

			let sAllMessageInformations = "";
			aAllMessages.map(oMessage => {
				// anstatt dem Timestamp soll Datum und Uhrzeit in leslicher Form ausgegeben werden
				const oMessageTimestampDate = new Date(oMessage.date);
				const sMessageDate = oMessageTimestampDate.toLocaleDateString();
				const sMessageTime = oMessageTimestampDate.toLocaleTimeString();

				const oMessageInformation = {
					date: sMessageDate,
					time: sMessageTime,
					type: oMessage.type,
					code: oMessage.code,
					id: oMessage.id,
					message: oMessage.message,
					description: oMessage.description,
					additionalText: oMessage.additionalText,
					target: oMessage.target,
					processor: oMessage.processor.getMetadata().getName(),
					persistent: oMessage.persistent,
					technical: oMessage.technical,
					validation: oMessage.validation
				};
				const sMessageInformation = JSON.stringify(oMessageInformation);
				sAllMessageInformations = sAllMessageInformations.concat(" \n ", sMessageInformation);
			});

			return sAllMessageInformations;
		}
	};
});