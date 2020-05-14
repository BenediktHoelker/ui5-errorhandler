sap.ui.define(["../handling/BaseHandling"], function (BaseHandling) {
  return BaseHandling.extend("errorhandler.library.handling.CheckBoxHandling", {
    // der ValueState einer Checkbox wird, im Gegensatz zu den anderen Controls dem Benutzer ohne besondere Behandlung nicht dargestellt

    showValueStateForCheckBoxes() {
      this.getAllControls()
        .filter((control) =>
          this.checkIfControlIsType(control, "sap.m.CheckBox")
        )
        .forEach((checkbox) =>
          checkbox.attachSelect((event) => {
            const oCheckBox = event.getSource();
            oCheckBox.setValueState(this.getValueStateOfCheckBox(oCheckBox));
            oCheckBox.rerender();
          })
        );
    },

    getValueStateOfCheckBox(oCheckBox) {
      const aMessages = oCheckBox
        .getBinding("selected")
        .getDataState()
        .getControlMessages();
      return aMessages.length > 0 ? aMessages[0].getType() : "None";
    },
  });
});
