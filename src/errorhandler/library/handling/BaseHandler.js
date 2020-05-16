sap.ui.define(
  [
    "sap/ui/core/message/Message",
    "sap/ui/test/OpaPlugin",
    "sap/ui/model/resource/ResourceModel",
  ],
  function (Message, OpaPlugin, ResourceModel) {
    return {
      getResBundle() {
        if (!this.resBundle) {
          this.resBundle = new ResourceModel({
            bundleName: "errorhandler.library.i18n.i18n",
          });
        }
        return this.resBundle;
      },

      getMessageModel() {
        return this.getMessageManager().getMessageModel();
      },

      getMessageManager() {
        return sap.ui.getCore().getMessageManager();
      },

      getAllControls() {
        const OPAPlugin = new OpaPlugin();
        return OPAPlugin.getAllControls();
      },

      checkIfControlIsType(control, type) {
        return (
          control &&
          typeof control.getMetadata === "function" &&
          typeof control.getMetadata().getName === "function" &&
          control.getMetadata().getName() === type
        );
      },

      getMessagesOfControl(control) {
        const binding = this.getBindingOfControl(control);

        if (!binding) {
          return this.getMessagesOfSmartField(control);
        }

        return binding
          .getDataState()
          .getMessages()
          .concat(this.getMessagesOfSmartField(control));
      },

      getMessagesOfSmartField(control) {
        const isSmartField = this.checkIfControlIsType(
          control,
          "sap.ui.comp.smartfield.SmartField"
        );

        if (
          isSmartField &&
          typeof control.getInnerControls === "function" &&
          control.getInnerControls().length > 0
        ) {
          const innerControl = control.getInnerControls()[0];
          const binding = this.getBindingOfControl(innerControl);

          if (binding) {
            return binding.getDataState().getMessages();
          }

          // falls das SmartField nicht editable oder nicht enabled ist, ist das innerControl ein sap.m.Text Control
          // die Messages dieses Controls können nicht über den DataState ausgelesen werden
          if (!control.getEnabled() || !control.getEditable()) {
            return this.getMessageModel()
              .getData()
              .filter(
                (message) =>
                  message.getTarget() === `${control.getId()}-input/value`
              );
          }
        }
        return [];
      },

      getBindingOfControl(control) {
        return ["value", "selected", "selectedKey", "dateValue"]
          .map((name) => control.getBinding(name))
          .find(Boolean);
      },

      getBindingName(control) {
        return ["value", "selected", "selectedKey", "dateValue"].find((name) =>
          control.getBinding(name)
        );
      },

      addValidationMsg({
        control,
        text,
        type,
        binding = this.getBindingOfControl(control),
        target = this.getValMsgTarget(control),
      }) {
        // damit die Messages bei einer Änderung des Bindings automatisch entfernt werden, muss das Binding einen Typen besitzen
        // => wird vom ControlMessageProcessor vorausgesetzt
        if (binding && !binding.getType()) {
          binding.setType(new sap.ui.model.type.String(), "string");
        }

        if (this.hasMsgWithTarget(target)) {
          return;
        }

        this.getMessageManager().addMessages(
          new Message({
            additionalText: this.getAdditionalText(control),
            target,
            processor: this.getMsgProcessor(),
            message: text,
            type,
            validation: true,
          })
        );
      },

      getAdditionalText(control) {
        // das erste Label mit Text wird verwendet
        return sap.ui.core.LabelEnablement.getReferencingLabels(control)
          .map((labelId) => sap.ui.getCore().byId(labelId))
          .map((label) => label.getText())
          .find((text) => text);
      },

      getValMsgTarget(control) {
        const isSmartField = this.checkIfControlIsType(
          control,
          "sap.ui.comp.smartfield.SmartField"
        );

        return isSmartField
          ? `${control.getId()}-input/value`
          : `${control.getId()}/${this.getBindingName(control)}`;
      },

      getMsgProcessor() {
        if (!this.msgProcessor) {
          this.msgProcessor = new sap.ui.core.message.ControlMessageProcessor();

          this.getMessageManager().registerMessageProcessor(this.msgProcessor);
        }

        return this.msgProcessor;
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

      removeValidationMsg({ control, target = this.getValMsgTarget(control) }) {
        this.getMessageManager().removeMessages(this.getMsgsWithTarget(target));
      },

      getMsgsWithTarget(target) {
        return this.getMessageModel()
          .getData()
          .filter((msg) => msg.target === target);
      },

      hasMsgWithTarget(sTarget) {
        return this.getMsgsWithTarget(sTarget).length > 0;
      },

      removeBckndMsgForControl(control) {
        if (!control.getBindingContext() || !control.getBinding("value")) {
          return;
        }

        const path = control.getBindingContext().getPath();
        const property = control.getBinding("value").getPath();

        const messages = control
          .getModel()
          .getMessagesByPath(`${path}/${property}`);

        this.getMessageManager().removeMessages(messages);
      },
    };
  }
);
