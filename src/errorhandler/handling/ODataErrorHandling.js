sap.ui.define(
  [
    "sap/ui/base/Object",
    "sap/base/Log",
    "sap/ui/core/message/Message",
    "sap/m/MessageBox",
  ],
  function (UI5Object, Log, Message, MessageBox) {
    return UI5Object.extend("errorhandler.validation.ServiceError", {
      // eslint-disable-next-line object-shorthand
      constructor: function ({ resBundle, messageModel } = {}, ...args) {
        UI5Object.apply(this, args);

        this.resBundle = resBundle;
        this.messageModel = messageModel;
      },

      addError(error) {
        const message = this.getError(error);
        if (
          !this.messageModel
            .getData()
            .some((msg) => msg.message === message.message)
        ) {
          sap.ui.getCore().getMessageManager().addMessages(message);
        }
      },

      displayErrorMessageBox(errorText) {
        if (this.messageBoxIsOpen) return;

        this.messageBoxIsOpen = true;

        MessageBox.error(errorText, {
          id: "serviceErrorMessageBox",
          closeOnNavigation: false,
          actions: [MessageBox.Action.CLOSE],
          onClose: () => {
            this.messageBoxIsOpen = false;
          },
        });
      },

      showError(error) {
        this.addError(error);
        this.displayErrorMessageBox(error.message);
      },

      getError(error) {
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

      parseError(errorText) {
        let error;
        try {
          error = JSON.parse(errorText);
        } catch (err) {
          Log.error(err);
          this.resBundle.getText("errorMessageCouldNotBeParsed");
        }

        // Safely accessing deeply nested properties:
        // https://medium.com/javascript-inside/safely-accessing-deeply-nested-values-in-javascript-99bf72a0855a
        const get = (p, o) =>
          p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

        return (
          get(["error", "message", "value"], error) ||
          this.resBundle.getText("message.undefined")
        );
      },
    });
  }
);
