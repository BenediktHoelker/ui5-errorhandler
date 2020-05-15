sap.ui.define(["../handling/BaseHandler"], function (BaseHandler) {
  return {
    // der ValueState einer Checkbox wird, im Gegensatz zu den anderen Controls dem Benutzer ohne besondere Behandlung nicht dargestellt

    showValueStateForCheckBoxes() {
      BaseHandler.getAllControls()
        .filter((control) =>
          BaseHandler.checkIfControlIsType(control, "sap.m.CheckBox")
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
  };
});
