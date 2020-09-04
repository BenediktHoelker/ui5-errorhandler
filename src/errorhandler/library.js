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
        this.messageModel = this.getMessageModel();
        this.resBundle = new ResourceModel({
          bundleName: "errorhandler.i18n.i18n",
        }).getResourceBundle();

        this.messagePopover = new MessagePopover(this);
        this.ODataErrorHandling = new ODataErrorHandling(this);

        this.msgProcessor = new sap.ui.core.message.ControlMessageProcessor();
        this.getMessageManager().registerMessageProcessor(this.msgProcessor);

        this.removeAllMessages();

        return this.registerModels({
          ODataModels,
        });
      },

      registerModels({ ODataModels }) {
        ODataModels.forEach((model) =>
          model.attachRequestFailed((event) => this.handleRequestFailed(event))
        );

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

      handleRequestFailed(event) {
        const response = event.getParameter("response");
        const { statusCode = 400, responseText = "" } = response;

        // => Explicitly use == because we don't know the format of the statusCode
        // eslint-disable-next-line eqeqeq
        if (responseText.includes("Timed Out") || statusCode == 504) {
          return this.showError(new Error(this.resBundle.getText("timedOut")));
        }

        // eslint-disable-next-line eqeqeq
        // if (statusCode == 500) {
        //   return this.showError(
        //     new Error(this.resBundle.getText("internalServerError"))
        //   );
        // }

        // An entity that was not found in the service is also throwing a 404 error in OData.
        // We already cover this case with a notFound target so we skip it here.
        // A request that cannot be sent to the server is a technical error that we have to handle though
        if (
          statusCode !== "404" ||
          (statusCode === 404 && responseText.indexOf("Cannot POST") === 0)
        ) {
          return this.ODataErrorHandling.displayErrorMessageBox(responseText);
        }

        return "";
      },

      removeAllMessages() {
        sap.ui.getCore().getMessageManager().removeAllMessages();
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

      getBindingName(input) {
        return ["value", "selected", "selectedKey", "dateValue"].find((name) =>
          input.getBinding(name)
        );
      },

      showError(error) {
        this.ODataErrorHandling.showError(error);
      },

      getValMsgTarget(input) {
        const isSmartField = input
          .getMetadata()
          .getElementName()
          .includes("SmartField");

        return isSmartField
          ? `${input.getId()}-input/value`
          : `${input.getId()}/${this.getBindingName(input)}`;
      },
    };
  }
);
