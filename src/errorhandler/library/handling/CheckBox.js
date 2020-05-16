sap.ui.define(["../handling/Base"], function (Base) {
  return {
    // der ValueState einer Checkbox wird, im Gegensatz zu den anderen Controls dem Benutzer ohne besondere Behandlung nicht dargestellt

    setShowValueStateForAllCheckBoxes() {
      Base.getAllControls()
        .filter((control) =>
          Base.checkIfControlIsType(control, "sap.m.CheckBox")
        )
        .forEach((checkbox) =>
          checkbox.attachSelect((event) => {
            const checkBox = event.getSource();
            checkBox.setValueState(this.getValueStateOfCheckBox(checkBox));
            checkBox.rerender();
          })
        );
    },

    getValueStateOfCheckBox(checkBox) {
      const messages = checkBox
        .getBinding("selected")
        .getDataState()
        .getControlMessages();
      return messages.length > 0 ? messages[0].getType() : "None";
    },
  };
});
