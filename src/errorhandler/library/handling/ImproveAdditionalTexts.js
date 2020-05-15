sap.ui.define(["../handling/BaseHandler"], (BaseHandler) => {
  return {
    // das MessageHandling liest immer automatisch sap.ui.core.LabelEnablement.getReferencingLabels aus
    // und benutzt den Text des Labels als AdditionalText im ErrorHandling
    // für einige Controls ist aber das sap.ui.core.LabelEnablement.getReferencingLabels nicht gesetzt
    // => mit dieser Methode werden die AdditionalTexts trotzdem gefüllt

    improveAdditionalTexts() {
      const allControls = BaseHandler.getAllControls();

      const controlsWithoutValueState = allControls.filter(
        (control) =>
          BaseHandler.checkIfControlIsType(control, "sap.m.RatingIndicator") ||
          BaseHandler.checkIfControlIsType(control, "sap.m.CheckBox")
      );

      const controlsWithoutDirectLabel = allControls.filter(
        (control) =>
          BaseHandler.checkIfControlIsType(control, "sap.m.Input") &&
          sap.ui.core.LabelEnablement.getReferencingLabels(control).length === 0
      );

      const controlsWithoutLabel = controlsWithoutValueState.concat(
        controlsWithoutDirectLabel
      );

      controlsWithoutLabel.forEach((control) =>
        this.improveAdditionalText(control)
      );

      allControls
        .filter((control) =>
          BaseHandler.checkIfControlIsType(
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
      const binding = BaseHandler.getBindingOfControl(control);

      if (!binding) {
        return;
      }

      binding.attachAggregatedDataStateChange(() =>
        this.addAdditionalText(control, binding)
      );

      binding.attachChange(() => this.addAdditionalText(control, binding));
    },

    addAdditionalText(control) {
      const messageManager = BaseHandler.getMessageManager();
      const messagesWithoutAdditionalText = BaseHandler.getMessagesOfControl(
        control
      ).filter((message) => !message.getAdditionalText());

      const sAdditionalText = this.getAdditionalTextForControl(control);

      messageManager.removeMessages(messagesWithoutAdditionalText);
      messagesWithoutAdditionalText.forEach((message) =>
        message.setAdditionalText(sAdditionalText)
      );
      messageManager.addMessages(messagesWithoutAdditionalText);
    },

    getAdditionalTextForControl(control) {
      const label = BaseHandler.getLabelIdsForControl(control)
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
        BaseHandler.checkIfControlIsType(
          control.getParent(),
          "sap.ui.comp.smartfield.SmartField"
        )
      ) {
        return BaseHandler.getLabelIdsForControl(control.getParent());
      }

      return [];
    },
  };
});
