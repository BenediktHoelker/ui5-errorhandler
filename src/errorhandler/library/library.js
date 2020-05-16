sap.ui.define(
  [
    "./handling/Base",
    "./handling/CheckBox",
    "./handling/AdditionalTexts",
    "./handling/MessagePopover",
    "./handling/ShowMessagesOnlyIfControlVisible",
    "./handling/ServiceError",
  ],
  function (
    Base,
    CheckBoxHandling,
    AdditionalTexts,
    MessagePopoverHandling,
    ShowMessagesOnlyIfControlVisible,
    ServiceErrHandling
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
        removeAllMessages = true,
      }) {
        if (removeAllMessages) {
          this.removeAllMessages();
        }

        Base.getAllControls()
          .filter(
            (control) =>
              control.getMetadata().getElementName() ===
              "sap.ui.core.ComponentContainer"
          )
          .forEach((component) =>
            component.attachComponentCreated(() =>
              this.initMessageEnhancements()
            )
          );

        ODataModels.forEach((model) => {
          Promise.all([
            this.waitForAppToBeRendered(viewModel, "/isRendered"),
            this.onMetadataFailed(model),
          ]).then(() => {
            viewModel.setProperty("/busy", false);

            ServiceErrHandling.showError({
              appUseable: false,
              error: Base.getResBundle().getText("metadataLoadingFailed"),
            });
          });

          model.attachMessageChange((oEvent) => {
            this.backendMessages = this.getNewBckndMsgs(oEvent);

            const error = this.backendMessages.find(
              (message) => message.getType() === sap.ui.core.MessageType.Error
            );

            if (error) {
              ServiceErrHandling.showError({
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

        Base.getMessageManager().removeMessages(duplicates);

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
          return ServiceErrHandling.showError({
            error: Base.getResBundle().getText("timedOut"),
          });
        }

        return ServiceErrHandling.showError({
          error: responseText,
        });
      },

      // ///////////////////////////////////////////////////////////////
      // Message Improvment
      // ///////////////////////////////////////////////////////////////

      initMessageEnhancements() {
        CheckBoxHandling.setShowValueStateForAllCheckBoxes();
        AdditionalTexts.improveAdditionalTexts();
        ShowMessagesOnlyIfControlVisible.init();
      },

      // ///////////////////////////////////////////////////////////////
      // Message Popover
      // ///////////////////////////////////////////////////////////////

      getMessagePopover() {
        return MessagePopoverHandling.getMessagePopover();
      },

      // ///////////////////////////////////////////////////////////////
      // Basics
      // ///////////////////////////////////////////////////////////////

      setMessageManager(view) {
        Base.getMessageManager().registerObject(view, true);
      },

      getMessageModel() {
        return Base.getMessageModel();
      },

      removeAllMessages() {
        Base.getMessageManager().removeAllMessages();
      },

      // ///////////////////////////////////////////////////////////////
      // Special-Messages => manuelles Hinzufügen und Löschen
      // ///////////////////////////////////////////////////////////////

      addMessage({
        input,
        text,
        target,
        additionalText,
        type = sap.ui.core.MessageType.Error,
      }) {
        if (input && text) {
          // Messages beziehen sich direkt auf das Control => Messages werden bei Änderungen automatisch entfernt
          Base.addValidationMsg({
            input,
            text,
            type,
          });
          return;
        }

        if (target) {
          Base.addManualMessage({
            target,
            text,
            additionalText,
            type,
          });
        }
      },

      removeMessage(options) {
        Base.removeValidationMsg(options);
      },

      removeBckndMsgForControl(control) {
        Base.removeBckndMsgForControl(control);
      },

      hasMessageWithTarget(sTarget) {
        return Base.hasMsgWithTarget(sTarget);
      },
    };
  }
);
