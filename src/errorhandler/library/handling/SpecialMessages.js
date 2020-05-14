sap.ui.define(
  ["../handling/BaseHandling", "sap/ui/core/message/Message"],
  function (BaseHandling, Message) {
    return BaseHandling.extend(
      "errorhandler.library.handling.SpecialMessages",
      {
        addValidationMsg({ input, text, type }) {
          const oBinding = this.getBindingOfControl(input);

          // damit die Messages bei einer Änderung des Bindings automatisch entfernt werden, muss das Binding einen Typen besitzen
          // => wird vom ControlMessageProcessor vorausgesetzt
          if (oBinding && !oBinding.getType()) {
            const oStringType = new sap.ui.model.type.String();
            oBinding.setType(oStringType, "string");
          }

          const sTarget = this.getValMsgTarget(input);

          if (this.hasMsgWithTarget(sTarget)) {
            return;
          }

          this.getMessageManager().addMessages(
            new Message({
              additionalText: this.getAdditionalText(input),
              target: sTarget,
              processor: this.getMsgProcessor(),
              message: text,
              type,
              validation: true,
            })
          );
        },

        getAdditionalText(oInput) {
          // das erste Label mit Text wird verwendet
          return sap.ui.core.LabelEnablement.getReferencingLabels(oInput)
            .map((labelId) => sap.ui.getCore().byId(labelId))
            .map((label) => label.getText())
            .find((text) => text);
        },

        getValMsgTarget(oInput) {
          const bIsSmartField =
            oInput.getMetadata().getElementName() ===
            "sap.ui.comp.smartfield.SmartField";
          return bIsSmartField
            ? `${oInput.getId()}-input/value`
            : `${oInput.getId()}/${this.getBindingName(oInput)}`;
        },

        getMsgProcessor() {
          if (!this.oMsgProcessor) {
            this.oMsgProcessor = new sap.ui.core.message.ControlMessageProcessor();
            this.getMessageManager().registerMessageProcessor(
              this.oMsgProcessor
            );
          }
          return this.oMsgProcessor;
        },

        addManualMessage({ target, text, additionalText, type }) {
          if (this.hasMsgWithTarget(target)) {
            return;
          }

          this.getMessageManager().addMessages(
            new Message({
              target,
              message: text,
              additionalText,
              type,
            })
          );
        },

        removeValidationMsg(oInput) {
          this._removeMsgsWithTarget(this.getValMsgTarget(oInput));
        },

        removeMsgsWithTarget(sTarget) {
          this.removeMsgsWithTarget(sTarget);
        },

        _removeMsgsWithTarget(sTarget) {
          this.getMessageManager().removeMessages(
            this.getMsgsWithTarget(sTarget)
          );
        },

        getMsgsWithTarget(sTarget) {
          return this.getMessageModel()
            .getData()
            .filter((message) => message.target === sTarget);
        },

        hasMsgWithTarget(sTarget) {
          return this.getMsgsWithTarget(sTarget).length > 0;
        },

        removeBckndMsgForControl(oInput) {
          if (!oInput.getBindingContext() || !oInput.getBinding("value")) {
            return;
          }

          const sBindingContextPath = oInput.getBindingContext().getPath();
          const sProperty = oInput.getBinding("value").getPath();

          const aBindingMessages = oInput
            .getModel()
            .getMessagesByPath(`${sBindingContextPath}/${sProperty}`);

          this.getMessageManager().removeMessages(aBindingMessages);
        },
      }
    );
  }
);
