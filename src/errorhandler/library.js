sap.ui.define(
  [
    "sap/ui/core/message/Message",
    "./handling/MessagePopover",
    "sap/ui/model/resource/ResourceModel",
    "./handling/ODataErrorHandling",
  ],
  function (Message, MessagePopover, ResourceModel, ODataErrorHandling) {
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
      init({ viewModel, ODataModels }) {
        this.resBundle = new ResourceModel({
          bundleName: "errorhandler.i18n.i18n",
        }).getResourceBundle();

        this.messagePopover = new MessagePopover({
          resBundle: this.resBundle,
          messageModel: this.getMessageModel(),
        });

        this.ODataErrorHandling = new ODataErrorHandling({
          resBundle,
          messageModel,
        });

        this.backendMessages = [];

        this.registerModels({
          ODataModels,
          viewModel,
        });
      },

      registerModels({ ODataModels, viewModel }) {
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

      removeMessages({ target }) {
        const msgModel = this.getMessageModel();
        const messages = msgModel
          .getData()
          .filter((msg) => msg.target === target);

        this.getMessageManager().removeMessages(messages);
      },

      addMessage({
        text,
        input,
        message = text,
        target = this.getValMsgTarget(input),
        additionalText,
        type = sap.ui.core.MessageType.Error,
      }) {
        // Wenn das Binding auf das sich die Message bezieht keinen Typen besitzt, dann wird die Message bei Änderung des Binding-Wertes nicht wieder automatisch entfernt
        const binding = input.getBinding(this.getBindingName(input));

        if (!binding.getType()) {
          binding.setType(new sap.ui.model.type.String(), "string");
        }

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

      /** =================================================
       *                       private
       *  ================================================= */

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
        const uniqueMessages = this.getArrayOfUnique(newMessages);

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
    };
  }
);
