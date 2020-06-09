sap.ui.define(
  ["sap/ui/base/Object", "./handling/ODataErrorHandling"],
  function (UI5Object, ODataErrorHandling) {
    return UI5Object.extend("errorhandler.Service", {
      // eslint-disable-next-line object-shorthand
      constructor: function (
        { resBundle, messageManager, messageModel } = {},
        ...args
      ) {
        UI5Object.apply(this, args);

        this.resBundle = resBundle;
        this.messageManager = messageManager;

        this.ODataErrorHandling = new ODataErrorHandling({
          resBundle,
          messageModel,
        });
      },

      waitForAppToBeRendered(viewModel) {
        if (viewModel.getProperty("/isRendered")) {
          return Promise.resolve();
        }

        return new Promise((resolve) =>
          viewModel.attachPropertyChange(() => {
            if (viewModel.getProperty("/isRendered")) {
              resolve();
            }
          })
        );
      },

      onMetadataFailed(ODataModel) {
        if (ODataModel.isMetadataLoadingFailed()) {
          return Promise.resolve();
        }

        return new Promise((resolve) =>
          ODataModel.attachMetadataFailed(() => resolve())
        );
      },

      getNewBckndMsgs(event) {
        const newMessages = event.getParameter("newMessages") || [];
        const uniqueMessages = this.getUnique(newMessages);

        const duplicates = newMessages.filter(
          (msg) => !uniqueMessages.includes(msg)
        );

        this.messageManager.removeMessages(duplicates);

        return uniqueMessages;
      },

      getArrayOfUnique(messages) {
        const messagesMap = messages.reduce((acc, curr) => {
          const key = msg.message ? msg.message.toString() : "01";

          acc[key] = msg;

          return acc;
        });

        return Object.values(messagesMap);
      },

      getBindingName(input) {
        return ["value", "selected", "selectedKey", "dateValue"].find((name) =>
          input.getBinding(name)
        );
      },

      showError(params) {
        this.ODataErrorHandling.showError(params);
      },

      showConnectionError(event) {
        const response = event.getParameter("response");
        const { responseText, statusCode } = response;

        if (responseText.includes("Timed Out") || statusCode === 504) {
          this.showError({
            error: this.resBundle.getText("timedOut"),
          });
        }
      },

      getValMsgTarget(input) {
        const isSmartField =
          input.getMetadata().getElementName() ===
          "sap.ui.comp.smartfield.SmartField";

        return isSmartField
          ? `${input.getId()}-input/value`
          : `${input.getId()}/${this.getBindingName(input)}`;
      },
    });
  }
);
