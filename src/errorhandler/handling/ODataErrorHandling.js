sap.ui.define(
  ["sap/ui/base/Object", "sap/ui/core/message/Message", "sap/m/MessageBox"],
  function (UI5Object, Message, MessageBox) {
    return UI5Object.extend("errorhandler.validation.ServiceError", {
      // eslint-disable-next-line object-shorthand
      constructor: function ({ resBundle, messageModel } = {}, ...args) {
        UI5Object.apply(this, args);

        this.resBundle = resBundle;
        this.messageModel = messageModel;
      },

      showError(error) {
        const message = this.getMessage(error);

        if (
          !this.messageModel
            .getData()
            .some((msg) => msg.message === message.message)
        ) {
          sap.ui.getCore().getMessageManager().addMessages(message);
        }

        if (this.messageBoxIsOpen) return;
        this.messageBoxIsOpen = true;

        MessageBox.error(message.message, {
          id: "serviceErrorMessageBox",
          closeOnNavigation: false,
          actions: [MessageBox.Action.CLOSE],
          onClose: () => {
            this.messageBoxIsOpen = false;
          },
        });
      },

      getMessage(error) {
        if (
          typeof error === "object" &&
          error.getMetadata &&
          error.getMetadata().getName &&
          error.getMetadata().getName() === "sap.ui.core.message.Message"
        ) {
          return error;
        }

        return new Message({
          message: error.message,
          type: sap.ui.core.MessageType.Error,
        });
      },
    });
  }
);
