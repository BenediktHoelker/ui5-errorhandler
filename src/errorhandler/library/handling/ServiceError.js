sap.ui.define(
  ["sap/ui/base/Object", "sap/ui/core/message/Message", "sap/m/MessageBox"],
  function (UI5Object, Message, MessageBox) {
    return UI5Object.extend("errorhandler.library.validation.ServiceError", {
      // eslint-disable-next-line object-shorthand
      constructor: function ({ resBundle, messageModel } = {}, ...args) {
        UI5Object.apply(this, args);

        this.resBundle = resBundle;
        this.messageModel = messageModel;
        this.messageBoxIsOpen = false;
      },

      showError({
        appUseable = true,
        error,
        parsedError = this.parseError(error),
      }) {
        if (
          !this.messageModel
            .getData()
            .some((msg) => msg.message === parsedError.message)
        ) {
          sap.ui.getCore().getMessageManager().addMessages(parsedError);
        }

        if (appUseable && this.messageBoxOpen) {
          return;
        }

        const text = appUseable
          ? parsedError.message
          : `${parsedError.message} ${this.resBundle.getText(
              "navToLaunchpad"
            )}`;

        this.messageBoxIsOpen = true;

        MessageBox.error(text, {
          actions: [MessageBox.Action.CLOSE],
          onClose: () => {
            this.messageBoxIsOpen = false;

            if (!appUseable && sap.ushell) {
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
    });
  }
);
