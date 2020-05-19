sap.ui.define(["sap/ui/test/OpaPlugin"], function (OpaPlugin) {
  return {
    // der ValueState einer Checkbox wird, im Gegensatz zu den anderen Controls dem Benutzer ohne besondere Behandlung nicht dargestellt

    setShowValueStateForAllCheckBoxes() {
      OpaPlugin.getAllControls()
        .filter((control) => this.checkControlIsType(control, "sap.m.CheckBox"))
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
  };
});
