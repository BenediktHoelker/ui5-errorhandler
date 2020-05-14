sap.ui.define(["../handling/BaseHandling"], function (BaseHandling) {
  return BaseHandling.extend("errorhandler.library.handling.MessageToggling", {
    // die Messages aller Controls sollen nur angezeigt werden wenn das Control visible ist
    // falls sich das visible-Binding ändert sollen die Messages nicht mehr / wieder angezeigt werden

    toggleControlMessages() {
      this.getAllControls()
        .map((control) => control.getBinding("visible"))
        .filter((binding) => !!binding)
        .forEach((binding) =>
          binding.attachChange((event) => {
            this.getAllControls()
              .filter(
                (control) => control.getBinding("visible") === event.getSource()
              )
              .forEach((control) =>
                this.toggleMessageOfControl(control, control.getVisible())
              );
          })
        );
    },

    toggleMessageOfControl(oControl, bIsVisible) {
      const aInvisibleMessages = this.getInvisibleMessages();
      const oMessageManager = this.getMessageManager();

      if (bIsVisible) {
        oMessageManager.addMessages(aInvisibleMessages[oControl.getId()]);
        delete aInvisibleMessages[oControl.getId()];
        this.setInvisibleMessages(aInvisibleMessages);
        return;
      }

      const aMessages = this.getMessagesOfControl(oControl);
      if (aMessages.length > 0) {
        aInvisibleMessages[oControl.getId()] = aMessages;
        oMessageManager.removeMessages(aMessages);
        this.setInvisibleMessages(aInvisibleMessages);
      }
    },

    getInvisibleMessages() {
      if (this.mInvisibleMessages === undefined) {
        this.mInvisibleMessages = {};
      }
      return this.mInvisibleMessages;
    },

    setInvisibleMessages(aInvisibleMessages) {
      this.mInvisibleMessages = aInvisibleMessages;
    },
  });
});
