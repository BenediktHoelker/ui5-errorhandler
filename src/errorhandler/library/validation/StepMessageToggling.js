sap.ui.define(["./BaseValidation"], function (Base) {
  return Base.extend(
    "validationservice.library.validation.StepMessageToggling",
    {
      toggleStepMessages(steps, showStep) {
        steps.forEach((step) => {
          // Array.prototype.concat.apply([] statt Array.flat() für Kompatibilität mit Edge
          const controlsInStep = step
            .getContent()
            .flatMap((content) =>
              this.checkControlIsType(content, "sap.ui.core.mvc.XMLView")
                ? content.getContent()
                : content
            );

          const aForms = controlsInStep.filter(
            (content) =>
              typeof content.getMetadata === "function" &&
              typeof content.getMetadata().getElementName === "function" &&
              content.getMetadata().getElementName() ===
                "sap.ui.layout.form.SimpleForm"
          );

          const aTables = controlsInStep.filter(
            (content) =>
              typeof content.getMetadata === "function" &&
              typeof content.getMetadata().getElementName === "function" &&
              content.getMetadata().getElementName() === "sap.m.Table"
          );

          const aInputs = aForms
            .concat(aTables)
            .map((parent) => this.getVisibleInputsInContent(parent));

          Array.prototype.concat
            .apply([], aInputs.concat(aTables))
            .forEach((control) =>
              this.toggleMessageOfControl(control, showStep)
            );
        });
      },

      toggleMessageOfControl(control, bIsVisible) {
        const aInvisibleMessages = this.getInvisibleMessages();
        const oMessageManager = sap.ui.getCore().getMessageManager();

        if (bIsVisible) {
          oMessageManager.addMessages(aInvisibleMessages[control.getId()]);
          delete aInvisibleMessages[control.getId()];
          this.setInvisibleMessages(aInvisibleMessages);
          return;
        }

        const aMessages = this.getMessagesOfControl(control);
        if (aMessages.length > 0) {
          aInvisibleMessages[control.getId()] = aMessages;
          oMessageManager.removeMessages(aMessages);
          this.setInvisibleMessages(aInvisibleMessages);
        }
      },

      getInvisibleMessages() {
        if (this.mInvisibleMessages === undefined) {
          this.mInvisibleMessages = {};
        }
        return this.mInvisibleMessages;
      },

      setInvisibleMessages(aInvisibleMessages) {
        this.mInvisibleMessages = aInvisibleMessages;
      },
    }
  );
});
