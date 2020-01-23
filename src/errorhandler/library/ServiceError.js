sap.ui.define([
	"sap/ui/core/message/Message",
	"sap/m/MessageBox",
	"sap/ui/core/MessageType"
], function (Message, MessageBox, MessageType) {
	"use strict";

	return {

		init: function (oLibrary) {
			this._oLibrary = oLibrary;

			// Flag um sicherzustellen dass nur ein Service Error gleichzeitig angezeigt wird
			this._bServiceErrorIsShown = false;
		},

		showError: function (oMessage) {
			if (this._bServiceErrorIsShown) {
				return;
			}

			this._bServiceErrorIsShown = true;
			MessageBox.error(
				oMessage.message, {
					actions: [MessageBox.Action.CLOSE],
					onClose: () => (this._bServiceErrorIsShown = false)

				}
			);
		},

		showAppNotUseableError: function (oMessage) {
			const sLaunchpadNavigationText = this._oLibrary._getResBundle().getText("navToLaunchpad");

			this._bServiceErrorIsShown = true;
			MessageBox.error(
				oMessage.message + " " + sLaunchpadNavigationText, {
					actions: [MessageBox.Action.OK],
					onClose: () => {
						this._bServiceErrorIsShown = false;
						this._navToLaunchpad();
					}
				}
			);
		},

		_navToLaunchpad: function () {
			const oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: "#"
				}
			});
		},

		createError: function (sMessage) {
			const oMessageManager = sap.ui.getCore().getMessageManager();
			const aAllMessages = oMessageManager.getMessageModel().getData();

			const oNewMessage = new Message({
				message: sMessage,
				type: MessageType.Error
			});
			const bMessageAlreadySet = aAllMessages.some(oMessage => {
				return oMessage.message === oNewMessage.message;
			});

			if (!bMessageAlreadySet) {
				oMessageManager.addMessages(oNewMessage);
			}

			return oNewMessage;
		}

	};
});