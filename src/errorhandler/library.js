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
      init({ ODataModels }) {
        this.backendMessages = [];
        this.messageModel = this.getMessageModel();
        this.resBundle = new ResourceModel({
          bundleName: "errorhandler.i18n.i18n",
        }).getResourceBundle();

        this.messagePopover = new MessagePopover(this);
        this.ODataErrorHandling = new ODataErrorHandling(this);

        this.msgProcessor = new sap.ui.core.message.ControlMessageProcessor();
        this.getMessageManager().registerMessageProcessor(this.msgProcessor);

        return this.registerModels({
          ODataModels,
        });
      },

      registerModels({ ODataModels }) {
        ODataModels.forEach((model) => this.attachErrorHandlingForModel(model));

        return Promise.all(
          ODataModels.map(
            (model) =>
              new Promise((resolve, reject) => {
                if (model.isMetadataLoadingFailed()) {
                  reject();
                }

                model.attachMetadataFailed(() => reject());

                model.metadataLoaded().then(resolve);
              })
          )
        ).catch(() => {
          throw new Error(this.resBundle.getText("metadataLoadingFailed"));
        });
      },

      attachErrorHandlingForModel(model) {
        model.attachMessageChange((event) => {
          this.backendMessages = this.getNewBckndMsgs(event);

          const error = this.backendMessages.find(
            (message) => message.getType() === sap.ui.core.MessageType.Error
          );

          if (error) {
            this.showError(error);
          }
        });

        model.attachRequestFailed((event) => {
          const response = oEvent.getParameter("response");
          const { statusCode, responseText } = response;

          if (responseText.includes("Timed Out") || statusCode === 504) {
            this.showError(new Error(this.resBundle.getText("timedOut")));
          }

          // An entity that was not found in the service is also throwing a 404 error in oData.
          // We already cover this case with a notFound target so we skip it here.
          // A request that cannot be sent to the server is a technical error that we have to handle though
          if (
            statusCode !== "404" ||
            (statusCode === 404 && responseText.indexOf("Cannot POST") === 0)
          ) {
            this.showError(new Error(responseText));
          }
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
        processor = this.msgProcessor,
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

      getMessagePopover() {
        return this.messagePopover.getMessagePopover();
      },

      /** =================================================
       *                       private
       *  ================================================= */

      getMessageManager() {
        return sap.ui.getCore().getMessageManager();
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

        this.getMessageManager().removeMessages(duplicates);

        return uniqueMessages;
      },

      getArrayOfUnique(messages) {
        const messagesMap = messages.reduce((acc, msg) => {
          const key = msg.message ? msg.message.toString() : "01";

          acc[key] = msg;

          return acc;
        }, {});

        return Object.values(messagesMap);
      },

      getBindingName(input) {
        return ["value", "selected", "selectedKey", "dateValue"].find((name) =>
          input.getBinding(name)
        );
      },

      showError(error) {
        this.ODataErrorHandling.showError(error);
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
