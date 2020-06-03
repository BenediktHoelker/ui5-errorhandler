sap.ui.define(
  [
    "sap/ui/core/message/Message",
    "./handling/MessagePopover",
    "./handling/ODataErrorHandling",
    "sap/ui/model/resource/ResourceModel",
  ],
  function (Message, MessagePopover, ODataErrorHandling, ResourceModel) {
    sap.ui.getCore().initLibrary({
      name: "errorhandler",
      version: "1.0.0",
      dependencies: ["sap.ui.core"],
      noLibraryCSS: true,
      types: [],
      interfaces: [],
      controls: [],
      elements: [],
    });

    return {
      init({
        appViewModel,
        viewModel = appViewModel,
        oDataModels,
        ODataModels = oDataModels,
      }) {
        this.resBundle = new ResourceModel({
          bundleName: "errorhandler.i18n.i18n",
        }).getResourceBundle();

        this.ODataErrorHandling = new ODataErrorHandling({
          resBundle: this.resBundle,
          messageModel: this.getMessageModel(),
        });

        this.messagePopover = new MessagePopover({
          resBundle: this.resBundle,
          messageModel: this.getMessageModel(),
        });

        this.backendMessages = [];

        ODataModels.forEach((model) => {
          Promise.all([
            this.waitForAppToBeRendered(viewModel),
            this.onMetadataFailed(model),
          ]).then(() => {
            viewModel.setProperty("/busy", false);

            this.showError({
              blocking: true,
              error: this.resBundle.getText("metadataLoadingFailed"),
            });
          });

          model.attachMessageChange((oEvent) => {
            this.backendMessages = this.getNewBckndMsgs(oEvent);

            const error = this.backendMessages.find(
              (message) => message.getType() === sap.ui.core.MessageType.Error
            );

            if (error) {
              this.showError({
                error,
              });
            }
          });

          model.attachRequestFailed((event) => {
            // falls der Request fehlschlägt, jedoch keine Message geliefert wurde trat ein Timeout bzw. Verbindungsabbruch auf
            if (this.backendMessages.length === 0) {
              this.showConnectionError(event);
            }
          });
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

        this.getMessageManager().removeMessages(duplicates);

        return uniqueMessages;
      },

      getUnique(messages) {
        return Array.from(
          new Set(messages.map((msg) => JSON.stringify(msg)))
        ).map((string) => JSON.parse(string));
      },

      showError(params) {
        this.ODataErrorHandling.showError(params);
      },

      showConnectionError(event) {
        const response = event.getParameter("response");
        const { responseText, statusText } = response;

        if (responseText.includes("Timed Out") || statusText === 504) {
          return this.showError({
            error: this.resBundle.getText("timedOut"),
          });
        }

        return this.showError({
          error: responseText,
        });
      },

      getMsgProcessor() {
        if (!this.msgProcessor) {
          this.msgProcessor = new sap.ui.core.message.ControlMessageProcessor();
          this.getMessageManager().registerMessageProcessor(this.msgProcessor);
        }
        return this.msgProcessor;
      },

      removeMessages({ target }) {
        const msgModel = this.getMessageManager().getMessageModel();
        const messages = msgModel
          .getData()
          .filter((msg) => msg.target === target);

        this.getMessageManager().removeMessages(messages);
      },

      getBindingName(input) {
        return ["value", "selected", "selectedKey", "dateValue"].find((name) =>
          input.getBinding(name)
        );
      },

      getValMsgTarget(input) {
        const isSmartField =
          input.getMetadata().getElementName() ===
          "sap.ui.comp.smartfield.SmartField";
        return isSmartField
          ? `${input.getId()}-input/value`
          : `${input.getId()}/${this.getBindingName(input)}`;
      },

      addMessage({
        text,
        input,
        message = text,
        processor = this.getMsgProcessor(),
        target = this.getValMsgTarget(input),
        additionalText,
        type = sap.ui.core.MessageType.Error,
      }) {
        this.getMessageManager().addMessages(
          new Message({
            additionalText,
            target,
            message,
            processor,
            type,
            validation: true,
          })
        );
      },

      getMessageModel() {
        return this.getMessageManager().getMessageModel();
      },

      getMessageManager() {
        return sap.ui.getCore().getMessageManager();
      },

      getMessagePopover() {
        return this.messagePopover.getMessagePopover();
      },
    };
  }
);
