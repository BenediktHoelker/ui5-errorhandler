sap.ui.define(
  [
    "../handling/BaseHandler",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox",
  ],
  function (BaseHandler, Message, MessageBox) {
    return {
      showError({ appUseable = true, error }) {
        const oError = this.getError(error);

        if (
          !BaseHandler.getMessageModel()
            .getData()
            .some((msg) => msg.message === oError.message)
        ) {
          BaseHandler.getMessageManager().addMessages(oError);
        }

        if (appUseable && this.ErrorIsShown) {
          return;
        }

        const sText = appUseable
          ? oError.message
          : `${oError.message} ${BaseHandler.getResBundle().getText(
              "navToLaunchpad"
            )}`;

        BaseHandler.ErrorIsShown = true;
        MessageBox.error(sText, {
          actions: [MessageBox.Action.CLOSE],
          onClose: () => {
            BaseHandler.ErrorIsShown = false;
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
    };
  }
);
