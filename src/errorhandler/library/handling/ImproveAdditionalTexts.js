sap.ui.define(["../handling/BaseHandler"], function (BaseHandler) {
  return {
    // das MessageHandling liest immer automatisch sap.ui.core.LabelEnablement.getReferencingLabels aus
    // und benutzt den Text des Labels als AdditionalText im ErrorHandling
    // für einige Controls ist aber das sap.ui.core.LabelEnablement.getReferencingLabels nicht gesetzt
    // => mit dieser Methode werden die AdditionalTexts trotzdem gefüllt

    improveAdditionalTexts() {
      const aAllControls = BaseHandler.getAllControls();

      const aControlsWithoutValueState = aAllControls.filter(
        (control) =>
          BaseHandler.checkIfControlIsType(control, "sap.m.RatingIndicator") ||
          BaseHandler.checkIfControlIsType(control, "sap.m.CheckBox")
      );

      const aControlsWithoutDirectLabel = aAllControls.filter(
        (control) =>
          BaseHandler.checkIfControlIsType(control, "sap.m.Input") &&
          sap.ui.core.LabelEnablement.getReferencingLabels(control).length === 0
      );

      const aControlsWithoutLabel = aControlsWithoutValueState.concat(
        aControlsWithoutDirectLabel
      );

      aControlsWithoutLabel.forEach((control) =>
        this.improveAdditionalText(control)
      );

      aAllControls
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

    improveAdditionalText(oControl) {
      const oBinding = BaseHandler.getBindingOfControl(oControl);
      if (!oBinding) {
        return;
      }

      oBinding.attachAggregatedDataStateChange(() =>
        this.addAdditionalText(oControl, oBinding)
      );
      oBinding.attachChange(() => this.addAdditionalText(oControl, oBinding));
    },

    addAdditionalText(oControl) {
      const oMessageManager = BaseHandler.getMessageManager();
      const aMessagesWithoutAdditionalText = BaseHandler.getMessagesOfControl(
        oControl
      ).filter((message) => !message.getAdditionalText());
      const sAdditionalText = BaseHandler.getAdditionalTextForControl(oControl);

      oMessageManager.removeMessages(aMessagesWithoutAdditionalText);
      aMessagesWithoutAdditionalText.forEach((message) =>
        message.setAdditionalText(sAdditionalText)
      );
      oMessageManager.addMessages(aMessagesWithoutAdditionalText);
    },

    getAdditionalTextForControl(oControl) {
      const oLabel = BaseHandler.getLabelIdsForControl(oControl)
        .map((id) => sap.ui.getCore().byId(id))
        .find((label) => label.getText());

      if (oLabel) {
        return oLabel.getText();
      }

      return "";
    },

    getLabelIdsForControl(oControl) {
      const aRefLabels = sap.ui.core.LabelEnablement.getReferencingLabels(
        oControl
      );
      if (aRefLabels && aRefLabels.length > 0) {
        return aRefLabels;
      }

      const aAriaLabels = oControl.getAriaLabelledBy();
      if (aAriaLabels && aAriaLabels.length > 0) {
        return aAriaLabels;
      }

      if (
        typeof oControl.getParent === "function" &&
        BaseHandler.checkIfControlIsType(
          oControl.getParent(),
          "sap.ui.comp.smartfield.SmartField"
        )
      ) {
        return BaseHandler.getLabelIdsForControl(oControl.getParent());
      }

      return [];
    },
  };
});
