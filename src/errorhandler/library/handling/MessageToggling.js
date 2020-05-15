sap.ui.define(["../handling/BaseHandler"], function (BaseHandler) {
  return {
    // die Messages aller Controls sollen nur angezeigt werden wenn das Control visible ist
    // falls sich das visible-Binding ändert sollen die Messages nicht mehr / wieder angezeigt werden

    toggleControlMessages() {
      BaseHandler.getAllControls()
        .map((control) => control.getBinding("visible"))
        .filter((binding) => !!binding)
        .forEach((binding) =>
          binding.attachChange((event) => {
            BaseHandler.getAllControls()
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
  };
});
