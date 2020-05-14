sap.ui.define(
  [
    "./handling/BaseHandling",
    "./handling/CheckBoxHandling",
    "./handling/ImproveAdditionalTexts",
    "./handling/MessagePopover",
    "./handling/MessageToggling",
    "./handling/ServiceError",
    "./handling/SpecialMessages",
  ],
  function (
    BaseHandling,
    CheckBoxHandling,
    ImproveAdditionalTexts,
    MessagePopoverHandling,
    MessageToggling,
    ServiceErrHandling,
    SpecialMsgHandling
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
      init({ appViewModel, oDataModels, removeAllMessages = true }) {
        if (removeAllMessages) {
          this.removeAllMessages();
        }

        this.initErrorHandling(oDataModels, appViewModel);
      },

      initErrorHandling(ODataModels, viewModel) {
        ODataModels.forEach((model) => {
          Promise.all([
            this.waitForAppToBeRendered(viewModel, "/isRendered"),
            this.onMetadataFailed(model),
          ]).then(() => {
            viewModel.setProperty("/busy", false);

            this.getServiceErrHandling().showError({
              appUseable: false,
              error: this.getBaseHandling()
                .getResBundle()
                .getText("metadataLoadingFailed"),
            });
          });

          model.attachMessageChange((oEvent) => {
            this.backendMessages = this.getNewBckndMsgs(oEvent);

            const error = this.backendMessages.find(
              (message) => message.getType() === sap.ui.core.MessageType.Error
            );

            if (error) {
              this.getServiceErrHandling().showError({
                error,
              });
            }
          });

          model.attachRequestFailed((oEvent) => {
            // falls der Request fehlschlägt, jedoch keine Message geliefert wurde trat ein Timeout bzw. Verbindungsabbruch auf
            if (this.backendMessages.length === 0) {
              this.showConnectionError(oEvent);
            }
          });
        });
      },

      waitForAppToBeRendered(oViewModel, sPropertyName) {
        if (oViewModel.getProperty(sPropertyName)) {
          return Promise.resolve();
        }

        return new Promise((resolve) =>
          oViewModel.attachPropertyChange(() => {
            if (oViewModel.getProperty(sPropertyName)) {
              resolve();
            }
          })
        );
      },

      onMetadataFailed(oODataModel) {
        if (oODataModel.isMetadataLoadingFailed()) {
          return Promise.resolve();
        }

        return new Promise((resolve) =>
          oODataModel.attachMetadataFailed(() => resolve())
        );
      },

      getNewBckndMsgs(oEvent) {
        const aNewMsgs = oEvent.getParameter("newMessages") || [];

        // Dublikate entfernen
        const aUniqueMsgs = this.getUniqueMsgs(aNewMsgs);

        const aDuplicates = aNewMsgs.filter(
          (oMsg) => !aUniqueMsgs.includes(oMsg)
        );

        this.getBaseHandling().getMessageManager().removeMessages(aDuplicates);

        return aUniqueMsgs;
      },

      getUniqueMsgs(messages) {
        return [new Set(messages.map((o) => JSON.stringify(o)))].map((s) =>
          JSON.parse(s)
        );
      },

      showConnectionError(oEvent) {
        const oServiceErrHandling = this.getServiceErrHandling();
        const oResponse = oEvent.getParameter("response");
        const sResponseText = oResponse.responseText;

        if (
          sResponseText.includes("Timed Out") ||
          oResponse.statusCode === 504
        ) {
          return oServiceErrHandling.showError({
            error: this.getBaseHandling().getResBundle().getText("timedOut"),
          });
        }

        return oServiceErrHandling.showError({
          error: sResponseText,
        });
      },

      getServiceErrHandling() {
        if (!this.oServiceErrHandling) {
          this.oServiceErrHandling = new ServiceErrHandling();
        }
        return this.oServiceErrHandling;
      },

      // ///////////////////////////////////////////////////////////////
      // Message Improvment
      // ///////////////////////////////////////////////////////////////

      initMessageImprovments() {
        this.getBaseHandling()
          .getAllControls()
          .filter(
            (control) =>
              control.getMetadata().getElementName() ===
              "sap.ui.core.ComponentContainer"
          )
          .forEach((component) =>
            component.attachComponentCreated(() =>
              this.initMessageImprovments()
            )
          );

        this.getCheckBoxHandling().showValueStateForCheckBoxes();
        this.getImproveAdditionalTexts().improveAdditionalTexts();
        this.getMessageToggling().toggleControlMessages();
      },

      getCheckBoxHandling() {
        if (!this.CheckBoxHandling) {
          this.CheckBoxHandling = new CheckBoxHandling();
        }
        return this.CheckBoxHandling;
      },

      getImproveAdditionalTexts() {
        if (!this.ImproveAdditionalTexts) {
          this.ImproveAdditionalTexts = new ImproveAdditionalTexts();
        }
        return this.ImproveAdditionalTexts;
      },

      getMessageToggling() {
        if (!this.MessageToggling) {
          this.MessageToggling = new MessageToggling();
        }
        return this.MessageToggling;
      },

      // ///////////////////////////////////////////////////////////////
      // Message Popover
      // ///////////////////////////////////////////////////////////////

      getMessagePopover() {
        return this.getMsgPopoverHandling().getMessagePopover();
      },

      getMsgPopoverHandling() {
        if (!this.oMsgPopoverHandling) {
          this.oMsgPopoverHandling = new MessagePopoverHandling();
        }
        return this.oMsgPopoverHandling;
      },

      // ///////////////////////////////////////////////////////////////
      // Basics
      // ///////////////////////////////////////////////////////////////

      setMessageManager(oView) {
        this.getBaseHandling().getMessageManager().registerObject(oView, true);
      },

      getMessageModel() {
        return this.getBaseHandling().getMessageModel();
      },

      removeAllMessages() {
        this.getBaseHandling().getMessageManager().removeAllMessages();
      },

      getBaseHandling() {
        if (!this.oBaseHandling) {
          this.oBaseHandling = new BaseHandling();
        }
        return this.oBaseHandling;
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
        const oSpecialMsgHandling = this.getSpecialMsgHandling();
        if (input && text) {
          // Messages beziehen sich direkt auf das Control => Messages werden bei Änderungen automatisch entfernt
          oSpecialMsgHandling.addValidationMsg({
            input,
            text,
            type,
          });
          return;
        }

        if (target) {
          oSpecialMsgHandling.addManualMessage({
            target,
            text,
            additionalText,
            type,
          });
        }
      },

      removeMessage({ input, target }) {
        const oSpecialMsgHandling = this.getSpecialMsgHandling();
        if (input) {
          oSpecialMsgHandling.removeValidationMsg(input);
          return;
        }
        if (target) {
          oSpecialMsgHandling.removeMsgsWithTarget(target);
        }
      },

      removeBckndMsgForControl(oInput) {
        this.getSpecialMsgHandling().removeBckndMsgForControl(oInput);
      },

      hasMessageWithTarget(sTarget) {
        return this.getSpecialMsgHandling().hasMsgWithTarget(sTarget);
      },

      getSpecialMsgHandling() {
        if (!this.SpecialMsgHandling) {
          this.SpecialMsgHandling = new SpecialMsgHandling();
        }
        return this.SpecialMsgHandling;
      },
    };
  }
);
