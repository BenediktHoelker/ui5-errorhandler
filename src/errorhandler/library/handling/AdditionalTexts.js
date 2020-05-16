sap.ui.define(["../handling/Base"], (Base) => {
  return {
    // das MessageHandling liest immer automatisch sap.ui.core.LabelEnablement.getReferencingLabels aus
    // und benutzt den Text des Labels als AdditionalText im ErrorHandling
    // für einige Controls ist aber das sap.ui.core.LabelEnablement.getReferencingLabels nicht gesetzt
    // => mit dieser Methode werden die AdditionalTexts trotzdem gefüllt

    improveAdditionalTexts() {
      const allControls = Base.getAllControls();

      const controlsWithoutValueState = allControls.filter(
        (control) =>
          Base.checkIfControlIsType(control, "sap.m.RatingIndicator") ||
          Base.checkIfControlIsType(control, "sap.m.CheckBox")
      );

      const controlsWithoutDirectLabel = allControls.filter(
        (control) =>
          Base.checkIfControlIsType(control, "sap.m.Input") &&
          sap.ui.core.LabelEnablement.getReferencingLabels(control).length === 0
      );

      controlsWithoutValueState
        .concat(controlsWithoutDirectLabel)
        .forEach((control) => this.improveAdditionalText(control));

      allControls
        .filter((control) =>
          Base.checkIfControlIsType(
            control,
            "sap.ui.comp.smartfield.SmartField"
          )
        )
        .forEach((smartField) =>
          smartField.attachInnerControlsCreated(() => {
            if (smartField.getInnerControls().length > 0) {
              this.improveAdditionalText(smartField.getInnerControls()[0]);
            }
          })
        );
    },

    improveAdditionalText(control) {
      const binding = Base.getBindingOfControl(control);

      if (!binding) {
        return;
      }

      binding.attachAggregatedDataStateChange(() =>
        this.setAdditionalText(control, binding)
      );

      binding.attachChange(() => this.setAdditionalText(control, binding));
    },

    setAdditionalText(control) {
      const additionalText = this.getAdditionalTextForControl(control);

      Base.getMessagesOfControl(control)
        .filter((message) => !message.getAdditionalText())
        .forEach((message) => message.setAdditionalText(additionalText));
    },

    getAdditionalTextForControl(control) {
      const label = this.getLabelIdsForControl(control)
        .map((id) => sap.ui.getCore().byId(id))
        .find((lbl) => lbl.getText());

      if (label) {
        return label.getText();
      }

      return "";
    },

    getLabelIdsForControl(control) {
      const ariaLabels = control.getAriaLabelledBy();
      const refLabels = sap.ui.core.LabelEnablement.getReferencingLabels(
        control
      );

      if (refLabels && refLabels.length > 0) {
        return refLabels;
      }

      if (ariaLabels && ariaLabels.length > 0) {
        return ariaLabels;
      }

      if (
        typeof control.getParent === "function" &&
        Base.checkIfControlIsType(
          control.getParent(),
          "sap.ui.comp.smartfield.SmartField"
        )
      ) {
        return Base.getLabelIdsForControl(control.getParent());
      }

      return [];
    },
  };
});
