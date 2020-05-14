sap.ui.define(
  [
    "../handling/BaseHandling",
    "../handling/CheckBoxHandling",
    "../handling/ImproveAdditionalTexts",
    "../handling/MessagePopover",
    "../handling/MessageToggling",
    "../handling/ServiceError",
    "../handling/SpecialMessages",
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
        this._initErrorHandling(oDataModels, appViewModel);
      },

      _initErrorHandling(aODataModels, oViewModel) {
        aODataModels.forEach((oODataModel) => {
          Promise.all([
            this._waitForAppToBeRendered(oViewModel, "/isRendered"),
            this._onMetadataFailed(oODataModel),
          ]).then(() => {
            oViewModel.setProperty("/busy", false);

            this._getServiceErrHandling().showError({
              appUseable: false,
              error: this._getBaseHandling()
                .getResBundle()
                .getText("metadataLoadingFailed"),
            });
          });

          oODataModel.attachMessageChange((oEvent) => {
            this._addedBcknMsgs = this._getNewBckndMsgs(oEvent);

            const oError = this._addedBcknMsgs.find(
              (message) => message.getType() === sap.ui.core.MessageType.Error
            );
            if (oError) {
              this._getServiceErrHandling().showError({
                error: oError,
              });
            }
          });

          oODataModel.attachRequestFailed((oEvent) => {
            // falls der Request fehlschlägt, jedoch keine Message geliefert wurde trat ein Timeout bzw. Verbindungsabbruch auf
            if (this._addedBcknMsgs.length === 0) {
              this._showConnectionError(oEvent);
            }
          });
        });
      },

      _waitForAppToBeRendered(oViewModel, sPropertyName) {
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

      _onMetadataFailed(oODataModel) {
        if (oODataModel.isMetadataLoadingFailed()) {
          return Promise.resolve();
        }

        return new Promise((resolve) =>
          oODataModel.attachMetadataFailed(() => resolve())
        );
      },

      _getNewBckndMsgs(oEvent) {
        const aNewMsgs = oEvent.getParameter("newMessages") || [];
        if (aNewMsgs.length === 0) {
          return aNewMsgs;
        }

        // Dublikate entfernen
        const aUniqueMsgs = this._getUniqueMsgs(aNewMsgs);

        const aDuplicates = aNewMsgs.filter(
          (oMsg) => !aUniqueMsgs.includes(oMsg)
        );
        this._getBaseHandling().getMessageManager().removeMessages(aDuplicates);

        return aUniqueMsgs;
      },

      _getUniqueMsgs(aMessages) {
        const aUniqueMsgs = [];
        aMessages.forEach((msg) => {
          if (
            !aUniqueMsgs.some(
              (uniqueMsg) =>
                uniqueMsg.target === msg.target &&
                (uniqueMsg.message.includes(msg.message) ||
                  msg.message.includes(uniqueMsg.message))
            )
          ) {
            aUniqueMsgs.push(msg);
          }
        });
        return aUniqueMsgs;
      },

      _showConnectionError(oEvent) {
        const oServiceErrHandling = this._getServiceErrHandling();
        const oResponse = oEvent.getParameter("response");
        const sResponseText = oResponse.responseText;

        if (
          sResponseText.includes("Timed Out") ||
          oResponse.statusCode === 504
        ) {
          return oServiceErrHandling.showError({
            error: this._getBaseHandling().getResBundle().getText("timedOut"),
          });
        }

        return oServiceErrHandling.showError({
          error: sResponseText,
        });
      },

      _getServiceErrHandling() {
        if (!this._oServiceErrHandling) {
          this._oServiceErrHandling = new ServiceErrHandling();
        }
        return this._oServiceErrHandling;
      },

      // ///////////////////////////////////////////////////////////////
      // Message Improvment
      // ///////////////////////////////////////////////////////////////

      initMessageImprovments() {
        this._getBaseHandling()
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

        this._getCheckBoxHandling().showValueStateForCheckBoxes();
        this._getImproveAdditionalTexts().improveAdditionalTexts();
        this._getMessageToggling().toggleControlMessages();
      },

      _getCheckBoxHandling() {
        if (!this._CheckBoxHandling) {
          this._CheckBoxHandling = new CheckBoxHandling();
        }
        return this._CheckBoxHandling;
      },

      _getImproveAdditionalTexts() {
        if (!this._ImproveAdditionalTexts) {
          this._ImproveAdditionalTexts = new ImproveAdditionalTexts();
        }
        return this._ImproveAdditionalTexts;
      },

      _getMessageToggling() {
        if (!this._MessageToggling) {
          this._MessageToggling = new MessageToggling();
        }
        return this._MessageToggling;
      },

      // ///////////////////////////////////////////////////////////////
      // Message Popover
      // ///////////////////////////////////////////////////////////////

      getMessagePopover() {
        return this._getMsgPopoverHandling().getMessagePopover();
      },

      _getMsgPopoverHandling() {
        if (!this._oMsgPopoverHandling) {
          this._oMsgPopoverHandling = new MessagePopoverHandling();
        }
        return this._oMsgPopoverHandling;
      },

      // ///////////////////////////////////////////////////////////////
      // Basics
      // ///////////////////////////////////////////////////////////////

      setMessageManager(oView) {
        this._getBaseHandling().getMessageManager().registerObject(oView, true);
      },

      getMessageModel() {
        return this._getBaseHandling().getMessageModel();
      },

      removeAllMessages() {
        this._getBaseHandling().getMessageManager().removeAllMessages();
      },

      _getBaseHandling() {
        if (!this._oBaseHandling) {
          this._oBaseHandling = new BaseHandling();
        }
        return this._oBaseHandling;
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
        const oSpecialMsgHandling = this._getSpecialMsgHandling();
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
        const oSpecialMsgHandling = this._getSpecialMsgHandling();
        if (input) {
          oSpecialMsgHandling.removeValidationMsg(input);
          return;
        }
        if (target) {
          oSpecialMsgHandling.removeMsgsWithTarget(target);
        }
      },

      removeBckndMsgForControl(oInput) {
        this._getSpecialMsgHandling().removeBckndMsgForControl(oInput);
      },

      hasMessageWithTarget(sTarget) {
        return this._getSpecialMsgHandling().hasMsgWithTarget(sTarget);
      },

      _getSpecialMsgHandling() {
        if (!this._SpecialMsgHandling) {
          this._SpecialMsgHandling = new SpecialMsgHandling();
        }
        return this._SpecialMsgHandling;
      },
    };
  }
);
