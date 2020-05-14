sap.ui.define(
  ["../handling/BaseHandling", "sap/ui/core/message/Message"],
  function (BaseHandling, Message) {
    "use strict";

    return BaseHandling.extend(
      "errorhandler.library.handling.SpecialMessages",
      {
        addValidationMsg: function ({ input, text, type }) {
          const oBinding = this.getBindingOfControl(input);

          // damit die Messages bei einer Änderung des Bindings automatisch entfernt werden, muss das Binding einen Typen besitzen
          // => wird vom ControlMessageProcessor vorausgesetzt
          if (oBinding && !oBinding.getType()) {
            const oStringType = new sap.ui.model.type.String();
            oBinding.setType(oStringType, "string");
          }

          const sTarget = this._getValMsgTarget(input);

          if (this.hasMsgWithTarget(sTarget)) {
            return;
          }

          this.getMessageManager().addMessages(
            new Message({
              additionalText: this._getAdditionalText(input),
              target: sTarget,
              processor: this._getMsgProcessor(),
              message: text,
              type: type,
              validation: true,
            })
          );
        },

        _getAdditionalText: function (oInput) {
          // das erste Label mit Text wird verwendet
          return sap.ui.core.LabelEnablement.getReferencingLabels(oInput)
            .map((labelId) => sap.ui.getCore().byId(labelId))
            .map((label) => label.getText())
            .find((text) => text);
        },

        _getValMsgTarget: function (oInput) {
          const bIsSmartField =
            oInput.getMetadata().getElementName() ===
            "sap.ui.comp.smartfield.SmartField";
          return bIsSmartField
            ? oInput.getId() + "-input/value"
            : oInput.getId() + "/" + this.getBindingName(oInput);
        },

        _getMsgProcessor: function () {
          if (!this._oMsgProcessor) {
            this._oMsgProcessor = new sap.ui.core.message.ControlMessageProcessor();
            this.getMessageManager().registerMessageProcessor(
              this._oMsgProcessor
            );
          }
          return this._oMsgProcessor;
        },

        addManualMessage: function ({ target, text, additionalText, type }) {
          if (this.hasMsgWithTarget(target)) {
            return;
          }

          this.getMessageManager().addMessages(
            new Message({
              target: target,
              message: text,
              additionalText: additionalText,
              type: type,
            })
          );
        },

        removeValidationMsg: function (oInput) {
          this._removeMsgsWithTarget(this._getValMsgTarget(oInput));
        },

        removeMsgsWithTarget: function (sTarget) {
          this._removeMsgsWithTarget(sTarget);
        },

        _removeMsgsWithTarget: function (sTarget) {
          this.getMessageManager().removeMessages(
            this._getMsgsWithTarget(sTarget)
          );
        },

        _getMsgsWithTarget: function (sTarget) {
          return this.getMessageModel()
            .getData()
            .filter((message) => message.target === sTarget);
        },

        hasMsgWithTarget: function (sTarget) {
          return this._getMsgsWithTarget(sTarget).length > 0;
        },

        removeBckndMsgForControl: function (oInput) {
          if (!oInput.getBindingContext() || !oInput.getBinding("value")) {
            return;
          }

          const sBindingContextPath = oInput.getBindingContext().getPath();
          const sProperty = oInput.getBinding("value").getPath();

          const aBindingMessages = oInput
            .getModel()
            .getMessagesByPath(sBindingContextPath + "/" + sProperty);

          this.getMessageManager().removeMessages(aBindingMessages);
        },
      }
    );
  }
);
