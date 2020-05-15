sap.ui.define(
  [
    "../handling/BaseHandler",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox",
  ],
  function (BaseHandler, Message, MessageBox) {
    return {
      showError({
        appUseable = true,
        error,
        parsedError = this.parseError(error),
      }) {
        if (
          !BaseHandler.getMessageModel()
            .getData()
            .some((msg) => msg.message === parsedError.message)
        ) {
          BaseHandler.getMessageManager().addMessages(parsedError);
        }

        if (appUseable && this.messageBoxOpen) {
          return;
        }

        const text = appUseable
          ? parsedError.message
          : `${parsedError.message} ${BaseHandler.getResBundle().getText(
              "navToLaunchpad"
            )}`;

        this.messageBoxOpen = true;

        MessageBox.error(text, {
          actions: [MessageBox.Action.CLOSE],
          onClose: () => {
            this.messageBoxOpen = false;

            if (!appUseable) {
              sap.ushell.Container.getService(
                "CrossApplicationNavigation"
              ).toExternal({
                target: {
                  semanticObject: "#",
                },
              });
            }
          },
        });
      },

      parseError(error) {
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
