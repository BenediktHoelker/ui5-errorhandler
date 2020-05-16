sap.ui.define(["../handling/Base"], function (Base) {
  return {
    // die Messages aller Controls sollen nur angezeigt werden wenn das Control visible ist
    // falls sich das visible-Binding ändert sollen die Messages nicht mehr / wieder angezeigt werden

    init() {
      Base.getAllControls()
        .filter((control) => control.getBinding("visible"))
        .forEach((control) =>
          control
            .getBinding("visible")
            .attachChange(() =>
              this.toggleMessagesOfControl(control, control.getVisible())
            )
        );
    },

    toggleMessagesOfControl(control, isVisible) {
      const messages = this.getMessagesOfControl(control);
      const messageManager = Base.getMessageManager();

      if (isVisible) {
        messageManager.addMessages(messages);
      } else {
        messageManager.removeMessages(messages);
      }
    },
  };
});
