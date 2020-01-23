sap.ui.define([
	"sap/ui/core/message/Message",
	"sap/ui/core/MessageType"
], function (Message, MessageType) {
	"use strict";

	return {

		init: function (oErrorHandlerComponent) {
			this._oComponent = oErrorHandlerComponent;

			this._oControlMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
			sap.ui.getCore().getMessageManager().registerMessageProcessor(this._oControlMessageProcessor);
		},

		addResourceNotFoundMessage: function (oInput, sMessage) {
			this._addManualValidationMessage(oInput, sMessage);
		},

		addManualValidationMessage: function (oInput, sMessage) {
			this._addManualValidationMessage(oInput, sMessage);
		},

		_addManualValidationMessage: function (oInput, sMessage) {
			const sTarget = this._getManualValidationTarget(oInput);
			const oBinding = oInput.getBinding("value");

			// damit die Messages bei einer Änderung des Bindings automatisch entfernt werden, muss das Binding einen Typen besitzen
			// => wird vom ControlMessageProcessor vorausgesetzt
			if (!oBinding.getType()) {
				const oStringType = new sap.ui.model.type.String();
				oBinding.setType(oStringType, "string");
			}

			const sLabelText = sap.ui.core.LabelEnablement.getReferencingLabels(oInput)
				.map(sLabelId => sap.ui.getCore().byId(sLabelId))
				.map(oLabel => oLabel.getText())
				// das erste Label mit Text wird verwendet
				.find(sText => sText);

			const oResourceNotFoundMessage = new Message({
				additionalText: sLabelText,
				message: sMessage,
				target: sTarget,
				type: "Error",
				processor: this._oControlMessageProcessor,
				validation: true
			});

			sap.ui.getCore().getMessageManager().addMessages(oResourceNotFoundMessage);
		},

		removeManualValidationMessage: function (oInput) {
			const sTarget = this._getManualValidationTarget(oInput);
			this._removeMessagesWithTarget(sTarget);
		},

		_getManualValidationTarget: function (oInput) {
			const bIsSmartField = oInput.getMetadata().getElementName() === "sap.ui.comp.smartfield.SmartField";
			const sTarget = bIsSmartField ? oInput.getId() + "-input/value" : oInput.getId() + "/value";
			return sTarget;
		},

		addManualMessage: function (oMessageDetails) {
			const oMessageManager = sap.ui.getCore().getMessageManager();

			const aAllMessages = oMessageManager.getMessageModel().getData();
			const bMessageAlreadySet = aAllMessages.some(oMessage => oMessage.target === oMessageDetails.target);
			if (bMessageAlreadySet) {
				return;
			}

			const oManualMessage = new Message({
				target: oMessageDetails.target,
				message: oMessageDetails.text,
				additionalText: oMessageDetails.additionalText,
				type: oMessageDetails.type ? oMessageDetails.type : MessageType.Error
			});
			oMessageManager.addMessages(oManualMessage);
		},

		removeManualMessage: function (sTarget) {
			this._removeMessagesWithTarget(sTarget);
		},

		_removeMessagesWithTarget: function (sTarget) {
			const aTargetMsgs = this._getMessagesWithTarget(sTarget);
			sap.ui.getCore().getMessageManager().removeMessages(aTargetMsgs);
		},

		_getMessagesWithTarget: function (sTarget) {
			const aAllMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
			const aTargetMsgs = aAllMessages.filter(oMessage => oMessage.target === sTarget);
			return aTargetMsgs;
		},

		removeMessagesWithTarget: function (sTarget) {
			this._removeMessagesWithTarget(sTarget);
		},

		removeBckndMsgForControl: function (oInput) {
			const sBindingContextPath = oInput.getBindingContext().getPath();
			const sProperty = oInput.getBinding("value").getPath();

			const oModel = oInput.getModel();
			const aBindingMessages = oModel.getMessagesByPath(sBindingContextPath + "/" + sProperty);

			sap.ui.getCore().getMessageManager().removeMessages(aBindingMessages);
		},

		hasMessageWithTarget: function (sTarget) {
			const aTargetMsgs = this._getMessagesWithTarget(sTarget);
			return aTargetMsgs.length > 0;
		}

	};
});