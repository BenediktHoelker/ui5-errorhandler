sap.ui.define(
  [
    "../handling/BaseHandling",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox",
  ],
  function (BaseHandling, Message, MessageBox) {
    return BaseHandling.extend("errorhandler.library.handling.ServiceError", {
      showError({ appUseable = true, error }) {
        const oError = this.getError(error);

        if (
          !this.getMessageModel()
            .getData()
            .some((msg) => msg.message === oError.message)
        ) {
          this.getMessageManager().addMessages(oError);
        }

        if (appUseable && this.ErrorIsShown) {
          return;
        }

        const sText = appUseable
          ? oError.message
          : `${oError.message} ${this.getResBundle().getText(
              "navToLaunchpad"
            )}`;

        this.ErrorIsShown = true;
        MessageBox.error(sText, {
          actions: [MessageBox.Action.CLOSE],
          onClose: () => {
            this.ErrorIsShown = false;
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

      getError(error) {
        if (typeof error === "object") {
          return error;
        }

        return new Message({
          message: error,
          type: sap.ui.core.MessageType.Error,
        });
      },
    });
  }
);
