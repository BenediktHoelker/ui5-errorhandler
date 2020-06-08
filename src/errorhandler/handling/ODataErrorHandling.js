sap.ui.define(
  ["sap/ui/base/Object", "sap/ui/core/message/Message", "sap/m/MessageBox"],
  function (UI5Object, Message, MessageBox) {
    return UI5Object.extend("errorhandler.validation.ServiceError", {
      // eslint-disable-next-line object-shorthand
      constructor: function ({ resBundle, messageModel } = {}, ...args) {
        UI5Object.apply(this, args);

        this.resBundle = resBundle;
        this.messageModel = messageModel;

        // Must not be initialised (when there are multiple components using the error handler within one App)
        // if(this.messageBoxIsOpen = false;
      },

      showError({
        blocking = false,
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

        if (!blocking || this.messageBoxIsOpen) return;

        const text = !blocking
          ? parsedError.message
          : `${parsedError.message} ${this.resBundle.getText(
              "navToLaunchpad"
            )}`;

        this.messageBoxIsOpen = true;

        MessageBox.error(text, {
          id: "serviceErrorMessageBox",
          actions: [MessageBox.Action.CLOSE],
          onClose: () => {
            this.messageBoxIsOpen = false;

            if (blocking && sap.ushell) {
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
