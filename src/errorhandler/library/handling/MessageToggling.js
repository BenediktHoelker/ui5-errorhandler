sap.ui.define(["../handling/BaseHandling"], function (BaseHandling) {
  "use strict";

  return BaseHandling.extend("errorhandler.library.handling.MessageToggling", {
    // die Messages aller Controls sollen nur angezeigt werden wenn das Control visible ist
    // falls sich das visible-Binding ändert sollen die Messages nicht mehr / wieder angezeigt werden

    toggleControlMessages: function () {
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
                this._toggleMessageOfControl(control, control.getVisible())
              );
          })
        );
    },

    _toggleMessageOfControl: function (oControl, bIsVisible) {
      const aInvisibleMessages = this._getInvisibleMessages();
      const oMessageManager = this.getMessageManager();

      if (bIsVisible) {
        oMessageManager.addMessages(aInvisibleMessages[oControl.getId()]);
        delete aInvisibleMessages[oControl.getId()];
        this._setInvisibleMessages(aInvisibleMessages);
        return;
      }

      const aMessages = this.getMessagesOfControl(oControl);
      if (aMessages.length > 0) {
        aInvisibleMessages[oControl.getId()] = aMessages;
        oMessageManager.removeMessages(aMessages);
        this._setInvisibleMessages(aInvisibleMessages);
      }
    },

    _getInvisibleMessages: function () {
      if (this._mInvisibleMessages === undefined) {
        this._mInvisibleMessages = {};
      }
      return this._mInvisibleMessages;
    },

    _setInvisibleMessages: function (aInvisibleMessages) {
      this._mInvisibleMessages = aInvisibleMessages;
    },
  });
});
