sap.ui.define(
  [
    "./CustomTypes",
    "sap/ui/core/message/Message",
    "./handling/MessagePopover",
    "sap/ui/model/resource/ResourceModel",
    "./handling/ServiceError",
    "./Validator",
  ],
  function (
    CustomTypes,
    Message,
    MessagePopover,
    ResourceModel,
    ServiceError,
    Validator
  ) {
    sap.ui.getCore().initLibrary({
      name: "errorhandler.library",
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
          bundleName: "errorhandler.library.i18n.i18n",
        }).getResourceBundle();

        this.errorHandler = new ServiceError({
          resBundle: this.resBundle,
          messageModel: this.getMessageModel(),
        });

        this.messagePopover = new MessagePopover({
          resBundle: this.resBundle,
          messageModel: this.getMessageModel(),
        });

        this.customValidations = [];
        this.backendMessages = [];
        this.customTypes = CustomTypes.init(this.resBundle);
        this.validator = new Validator();

        ODataModels.forEach((model) => {
          Promise.all([
            this.waitForAppToBeRendered(viewModel, "/isRendered"),
            this.onMetadataFailed(model),
          ]).then(() => {
            viewModel.setProperty("/busy", false);

            this.errorHandler.showError({
              appUseable: false,
              error: this.resBundle.getText("metadataLoadingFailed"),
            });
          });

          model.attachMessageChange((oEvent) => {
            this.backendMessages = this.getNewBckndMsgs(oEvent);

            const error = this.backendMessages.find(
              (message) => message.getType() === sap.ui.core.MessageType.Error
            );

            if (error) {
              this.errorHandler.showError({
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

      getMessageModel() {
        return this.getMessageManager().getMessageModel();
      },

      getMessageManager() {
        return sap.ui.getCore().getMessageManager();
      },

      validate(root) {
        return this.validator.validate(root);
      },

      getCustomTypes() {
        return this.customTypes;
      },

      waitForAppToBeRendered(viewModel, property) {
        if (viewModel.getProperty(property)) {
          return Promise.resolve();
        }

        return new Promise((resolve) =>
          viewModel.attachPropertyChange(() => {
            if (viewModel.getProperty(property)) {
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
        const uniqueMessages = this.getUniqueMsgs(newMessages);

        const duplicates = newMessages.filter(
          (msg) => !uniqueMessages.includes(msg)
        );

        this.getMessageManager().removeMessages(duplicates);

        return uniqueMessages;
      },

      getUniqueMsgs(messages) {
        return Array.from(
          new Set(messages.map((msg) => JSON.stringify(msg)))
        ).map((string) => JSON.parse(string));
      },

      showConnectionError(event) {
        const response = event.getParameter("response");
        const { responseText } = response;

        if (responseText.includes("Timed Out") || response.statusCode === 504) {
          return this.errorHandler.showError({
            error: this.resBundle.getText("timedOut"),
          });
        }

        return this.errorHandler.showError({
          error: responseText,
        });
      },

      getMessagePopover() {
        return this.messagePopover.getMessagePopover();
      },

      setMessageManager(view) {
        this.getMessageManager().registerObject(view, true);
      },

      addMessage({
        text,
        message = text,
        target,
        additionalText,
        type = sap.ui.core.MessageType.Error,
      }) {
        this.getMessageManager().addMessages(
          new Message({
            additionalText,
            target,
            processor: this.getMsgProcessor(),
            message,
            type,
            validation: true,
          })
        );
      },

      removeMessage() {},

      removeBckndMsgForControl() {},

      setCustomValidations(customValidations) {
        this.customValidations = customValidations;
      },

      getCustomValidations() {
        return this.customValidations;
      },

      checkCustomValidations() {
        const customValidations = this.getCustomValidations();

        if (!customValidations) {
          return true;
        }

        return Object.values(customValidations).every(
          ({ check, control = {}, target = control.getId(), message }) => {
            if (check()) {
              this.getMessageManager().removeMessage({
                target,
                text: message,
              });
              return true;
            }

            this.getMessageManager().addMessage({
              // die Messages können sich aktuell nur auf ein Target beziehen, noch nicht auf ein Control-Binding
              target: control.getId(),
            });
            return false;
          }
        );
      },
    };
  }
);
