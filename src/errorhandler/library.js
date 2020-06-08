sap.ui.define(
  [
    "sap/ui/core/message/Message",
    "./handling/MessagePopover",
    "sap/ui/model/resource/ResourceModel",
    "./Service",
  ],
  function (Message, MessagePopover, ResourceModel, Service) {
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

        this.messagePopover = new MessagePopover({
          resBundle: this.resBundle,
          messageModel: this.getMessageModel(),
        });

        this.service = new Service({
          resBundle: this.resBundle,
          messageManager: this.getMessageManager(),
          messageModel: this.getMessageModel(),
        });

        this.backendMessages = [];

        this.msgProcessor = new sap.ui.core.message.ControlMessageProcessor();
        this.getMessageManager().registerMessageProcessor(this.msgProcessor);

        ODataModels.forEach((model) => {
          Promise.all([
            this.service.waitForAppToBeRendered(viewModel),
            this.service.onMetadataFailed(model),
          ]).then(() => {
            viewModel.setProperty("/busy", false);

            this.service.showError({
              blocking: true,
              error: this.resBundle.getText("metadataLoadingFailed"),
            });
          });

          model.attachMessageChange((oEvent) => {
            this.backendMessages = this.service.getNewBckndMsgs(oEvent);

            const error = this.backendMessages.find(
              (message) => message.getType() === sap.ui.core.MessageType.Error
            );

            if (error) {
              this.service.showError({
                error,
              });
            }
          });

          model.attachRequestFailed((event) => {
            // falls der Request fehlschlägt, jedoch keine Message geliefert wurde trat ein Timeout bzw. Verbindungsabbruch auf
            if (this.backendMessages.length === 0) {
              this.service.showConnectionError(event);
            }
          });
        });
      },

      removeMessages({ target }) {
        const msgModel = this.getMessageManager().getMessageModel();
        const messages = msgModel
          .getData()
          .filter((msg) => msg.target === target);

        this.getMessageManager().removeMessages(messages);
      },

      addMessage({
        text,
        input,
        message = text,
        processor = this.msgProcessor,
        target = this.service.getValMsgTarget(input),
        additionalText,
        type = sap.ui.core.MessageType.Error,
      }) {
        // Wenn das Binding auf das sich die Message bezieht keinen Typen besitzt, dann wird die Message bei Änderung des Binding-Wertes nicht wieder automatisch entfernt
        const binding = input.getBinding(this.service.getBindingName(input));
        if (!binding.getType()) {
          const stringType = new sap.ui.model.type.String();
          binding.setType(stringType, "string");
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
    };
  }
);
