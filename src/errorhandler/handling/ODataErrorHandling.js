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

      extractErrorTextFrom(error) {
        if (error && error.message) return error.message;

        try {
          return this.extractErrorMsgFromJSON(error);
        } catch (errJSON) {
          try {
            return this.extractErrorMsgFromXML(error);
          } catch (errXML) {
            return this.resBundle.getText("errorMessageCouldNotBeParsed");
          }
        }
      },

      extractErrorMsgFromXML(error) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(error, "text/xml");
        return xmlDoc
          .getElementsByTagName("error")[0]
          .getElementsByTagName("message")[0].childNodes[0].wholeText;
      },

      extractErrorMsgFromJSON(error) {
        const parsedError = JSON.parse(error);

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
