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

      showError(error) {
        const ui5Message = this.getUI5MessageFrom(error);

        if (
          !this.messageModel
            .getData()
            .some((msg) => msg.message === ui5Message.message)
        ) {
          sap.ui.getCore().getMessageManager().addMessages(ui5Message);
        }

        this.displayErrorMessageBox(error);
      },

      displayErrorMessageBox(error) {
        if (this.messageBoxIsOpen) return;

        this.messageBoxIsOpen = true;

        MessageBox.error(this.extractErrorTextFrom(error), {
          id: "serviceErrorMessageBox",
          closeOnNavigation: false,
          actions: [MessageBox.Action.CLOSE],
          onClose: () => {
            this.messageBoxIsOpen = false;
          },
        });
      },

      getUI5MessageFrom(error) {
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

      extractErrorTextFrom(error = "{}") {
        if (error.message) return error.message;

        let parsedError;

        try {
          parsedError = JSON.parse(error);
        } catch (err) {
          Log.error(err);
          return this.resBundle.getText("errorMessageCouldNotBeParsed");
        }

        // Safely accessing deeply nested properties:
        // https://medium.com/javascript-inside/safely-accessing-deeply-nested-values-in-javascript-99bf72a0855a
        const get = (p, o) =>
          p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

        return (
          get(["error", "message", "value"], parsedError) ||
          this.resBundle.getText("errorMessageCouldNotBeRead")
        );
      },
    });
  }
);
