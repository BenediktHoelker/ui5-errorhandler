sap.ui.define(["./BaseValidation"], function (Base) {
  return Base.extend("validationservice.library.validation.WizardValidation", {
    handleValidation({
      changedControl,
      control = changedControl,
      validateNextStep = false,
      validateAllSteps = true,
    }) {
      const wizard = this.getFirstParentOfType(control, "sap.m.Wizard");
      const step = this.getFirstParentOfType(control, "sap.m.WizardStep");
      const nextStep = sap.ui.getCore().byId(step.getNextStep());

      // falls nur der nächste Step validiert werden soll
      if (validateNextStep) {
        return this.validateStep(nextStep);
      }

      if (validateAllSteps) {
        return this.validateProgressStep(wizard);
      }

      return this.validateStep(step);
    },

    validateStep(step) {
      step.setValidated(this.getContentIsValid(step));
    },

    validateProgressStep(wizard) {
      const wizardIsValid = this.getActiveSteps(wizard).get((step) =>
        step.getValidated()
      );

      wizard.getProgressStep().setValidated(wizardIsValid);
      return wizardIsValid;
    },

    getActiveSteps(wizard) {
      return wizard
        .getSteps()
        .filter((step, index) => index <= wizard.getProgress());
    },
  });
});
