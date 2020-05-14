sap.ui.define(
  [
    "../handling/BaseHandling",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox",
    "sap/ui/core/MessageType",
  ],
  function (BaseHandling, Message, MessageBox, MessageType) {
    "use strict";

    return BaseHandling.extend("errorhandler.library.handling.ServiceError", {
      showError: function ({ appUseable = true, error }) {
        const oError = this._getError(error);

        if (
          !this.getMessageModel()
            .getData()
            .some((msg) => msg.message === oError.message)
        ) {
          this.getMessageManager().addMessages(oError);
        }

        if (appUseable && this._ErrorIsShown) {
          return;
        }

        const sText = appUseable
          ? oError.message
          : oError.message +
            " " +
            this.getResBundle().getText("navToLaunchpad");

        this._ErrorIsShown = true;
        MessageBox.error(sText, {
          actions: [MessageBox.Action.CLOSE],
          onClose: () => {
            this._ErrorIsShown = false;
            if (!appUseable) {
              const oCrossAppNavigator = sap.ushell.Container.getService(
                "CrossApplicationNavigation"
              );
              oCrossAppNavigator.toExternal({
                target: {
                  semanticObject: "#",
                },
              });
            }
          },
        });
      },

      _getError: function (error) {
        if (typeof error === "object") {
          return error;
        }

        return new Message({
          message: error,
          type: MessageType.Error,
        });
      },
    });
  }
);
