sap.ui.define(["../handling/BaseHandling"], function (BaseHandling) {
  return BaseHandling.extend(
    "errorhandler.library.handling.ImproveAdditionalTexts",
    {
      // das MessageHandling liest immer automatisch sap.ui.core.LabelEnablement.getReferencingLabels aus
      // und benutzt den Text des Labels als AdditionalText im ErrorHandling
      // für einige Controls ist aber das sap.ui.core.LabelEnablement.getReferencingLabels nicht gesetzt
      // => mit dieser Methode werden die AdditionalTexts trotzdem gefüllt

      improveAdditionalTexts() {
        const aAllControls = this.getAllControls();

        const aControlsWithoutValueState = aAllControls.filter(
          (control) =>
            this.checkIfControlIsType(control, "sap.m.RatingIndicator") ||
            this.checkIfControlIsType(control, "sap.m.CheckBox")
        );

        const aControlsWithoutDirectLabel = aAllControls.filter(
          (control) =>
            this.checkIfControlIsType(control, "sap.m.Input") &&
            sap.ui.core.LabelEnablement.getReferencingLabels(control).length ===
              0
        );

        const aControlsWithoutLabel = aControlsWithoutValueState.concat(
          aControlsWithoutDirectLabel
        );

        aControlsWithoutLabel.forEach((control) =>
          this._improveAdditionalText(control)
        );

        aAllControls
          .filter((control) =>
            this.checkIfControlIsType(
              control,
              "sap.ui.comp.smartfield.SmartField"
            )
          )
          .forEach((smartField) =>
            smartField.attachInnerControlsCreated(() => {
              if (smartField.getInnerControls().length > 0) {
                this._improveAdditionalText(smartField.getInnerControls()[0]);
              }
            })
          );
      },

      _improveAdditionalText(oControl) {
        const oBinding = this.getBindingOfControl(oControl);
        if (!oBinding) {
          return;
        }

        oBinding.attachAggregatedDataStateChange(() =>
          this._addAdditionalText(oControl, oBinding)
        );
        oBinding.attachChange(() =>
          this._addAdditionalText(oControl, oBinding)
        );
      },

      _addAdditionalText(oControl) {
        const oMessageManager = this.getMessageManager();
        const aMessagesWithoutAdditionalText = this.getMessagesOfControl(
          oControl
        ).filter((message) => !message.getAdditionalText());
        const sAdditionalText = this._getAdditionalTextForControl(oControl);

        oMessageManager.removeMessages(aMessagesWithoutAdditionalText);
        aMessagesWithoutAdditionalText.forEach((message) =>
          message.setAdditionalText(sAdditionalText)
        );
        oMessageManager.addMessages(aMessagesWithoutAdditionalText);
      },

      _getAdditionalTextForControl(oControl) {
        const oLabel = this._getLabelIdsForControl(oControl)
          .map((id) => sap.ui.getCore().byId(id))
          .find((label) => label.getText());

        if (oLabel) {
          return oLabel.getText();
        }

        return "";
      },

      _getLabelIdsForControl(oControl) {
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
          this.checkIfControlIsType(
            oControl.getParent(),
            "sap.ui.comp.smartfield.SmartField"
          )
        ) {
          return this._getLabelIdsForControl(oControl.getParent());
        }

        return [];
      },
    }
  );
});
