sap.ui.define(
  ["../handling/BaseHandler", "sap/ui/core/message/Message"],
  function (BaseHandler, Message) {
    return {
      addValidationMsg({
        input,
        text,
        type,
        binding = BaseHandler.getBindingOfControl(input),
        target = this.getValMsgTarget(input),
      }) {
        // damit die Messages bei einer Änderung des Bindings automatisch entfernt werden, muss das Binding einen Typen besitzen
        // => wird vom ControlMessageProcessor vorausgesetzt
        if (binding && !binding.getType()) {
          binding.setType(new sap.ui.model.type.String(), "string");
        }

        if (this.hasMsgWithTarget(target)) {
          return;
        }

        BaseHandler.getMessageManager().addMessages(
          new Message({
            additionalText: this.getAdditionalText(input),
            target,
            processor: this.getMsgProcessor(),
            message: text,
            type,
            validation: true,
          })
        );
      },

      getAdditionalText(input) {
        // das erste Label mit Text wird verwendet
        return sap.ui.core.LabelEnablement.getReferencingLabels(input)
          .map((labelId) => sap.ui.getCore().byId(labelId))
          .map((label) => label.getText())
          .find((text) => text);
      },

      getValMsgTarget(input) {
        const bIsSmartField =
          input.getMetadata().getElementName() ===
          "sap.ui.comp.smartfield.SmartField";
        return bIsSmartField
          ? `${input.getId()}-input/value`
          : `${input.getId()}/${this.getBindingName(input)}`;
      },

      getMsgProcessor() {
        if (!this.msgProcessor) {
          this.msgProcessor = new sap.ui.core.message.ControlMessageProcessor();

          BaseHandler.getMessageManager().registerMessageProcessor(
            this.msgProcessor
          );
        }

        return this.msgProcessor;
      },

      addManualMessage({ target, text, additionalText, type }) {
        if (this.hasMsgWithTarget(target)) {
          return;
        }

        BaseHandler.getMessageManager().addMessages(
          new Message({
            target,
            message: text,
            additionalText,
            type,
          })
        );
      },

      removeValidationMsg({ control, target = this.getValMsgTarget(control) }) {
        this.getMessageManager().removeMessages(
          BaseHandler.getMsgsWithTarget(target)
        );
      },

      getMsgsWithTarget(target) {
        BaseHandler.getMessageModel()
          .getData()
          .filter((msg) => msg.target === target);
      },

      hasMsgWithTarget(sTarget) {
        return this.getMsgsWithTarget(sTarget).length > 0;
      },

      removeBckndMsgForControl(input) {
        if (!input.getBindingContext() || !input.getBinding("value")) {
          return;
        }

        const path = input.getBindingContext().getPath();
        const property = input.getBinding("value").getPath();

        const messages = input
          .getModel()
          .getMessagesByPath(`${path}/${property}`);

        BaseHandler.getMessageManager().removeMessages(messages);
      },
    };
  }
);
