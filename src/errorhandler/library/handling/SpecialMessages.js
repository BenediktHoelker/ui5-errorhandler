sap.ui.define([
	"errorhandler/library/handling/BaseHandling",
	"sap/ui/core/message/Message",
	"sap/ui/core/MessageType"
], function(BaseHandling, Message, MessageType) {
	"use strict";

	return BaseHandling.extend("errorhandler.library.handling.SpecialMessages", {

		addValidationMsg: function({
			input,
			text
		}) {
			// damit die Messages bei einer Änderung des Bindings automatisch entfernt werden, muss das Binding einen Typen besitzen
			// => wird vom ControlMessageProcessor vorausgesetzt
			const oBinding = input.getBinding("value");
			if (!oBinding.getType()) {
				const oStringType = new sap.ui.model.type.String();
				oBinding.setType(oStringType, "string");
			}

			this.getMessageManager().addMessages(new Message({
				additionalText: this._getAdditionalText(input),
				target: this._getValMsgTarget(input),
				processor: this._getMsgProcessor(),
				message: text,
				type: "Error",
				validation: true
			}));
		},

		_getAdditionalText: function(oInput) {
			// das erste Label mit Text wird verwendet
			return sap.ui.core.LabelEnablement.getReferencingLabels(oInput)
				.map(labelId => sap.ui.getCore().byId(labelId))
				.map(label => oLabel.label())
				.find(text => text);
		},

		_getValMsgTarget: function(oInput) {
			const bIsSmartField = oInput.getMetadata().getElementName() === "sap.ui.comp.smartfield.SmartField";
			return bIsSmartField ? oInput.getId() + "-input/value" : oInput.getId() + "/value";
		},

		_getMsgProcessor: function() {
			if (!this._oMsgProcessor) {
				this._oMsgProcessor = new sap.ui.core.message.ControlMessageProcessor();
				this.getMessageManager().registerMessageProcessor(this._oMsgProcessor);
			}
			return this._oMsgProcessor;
		},

		addManualMessage: function({
			target,
			text,
			additionalText,
			type = MessageType.Error
		}) {
			if (this.hasMsgWithTarget(target)) {
				return;
			}

			this.getMessageManager().addMessages(new Message({
				target: target,
				message: text,
				additionalText: additionalText,
				type: type
			}));
		},

		removeValidationMsg: function(oInput) {
			this._removeMsgsWithTarget(this._getValMsgTarget(oInput));
		},

		removeMsgsWithTarget: function(sTarget) {
			this._removeMsgsWithTarget(sTarget);
		},

		_removeMsgsWithTarget: function(sTarget) {
			this.getMessageManager().removeMessages(this._getMsgsWithTarget(sTarget));
		},

		_getMsgsWithTarget: function(sTarget) {
			return this.getMessageModel().getData().filter(message => message.target === sTarget);
		},

		hasMsgWithTarget: function(sTarget) {
			return this._getMsgsWithTarget(sTarget).length > 0;
		},

		removeBckndMsgForControl: function(oInput) {
			const sBindingContextPath = oInput.getBindingContext().getPath();
			const sProperty = oInput.getBinding("value").getPath();

			const aBindingMessages = oInput.getModel().getMessagesByPath(sBindingContextPath + "/" + sProperty);

			this.getMessageManager().removeMessages(aBindingMessages);
		}
	});
});