sap.ui.define(
  [
    "sap/ui/base/Object",
    "sap/ui/test/OpaPlugin",
    "sap/ui/model/resource/ResourceModel",
  ],
  function (Object, OpaPlugin, ResourceModel) {
    return Object.extend("errorhandler.library.handling.BaseHandling", {
      getResBundle() {
        if (!this.resBundle) {
          this.resBundle = new ResourceModel({
            bundleName: "errorhandler.library.i18n.i18n",
          });
        }
        return this.resBundle;
      },

      getMessageModel() {
        return this.getMessageManager().getMessageModel();
      },

      getMessageManager() {
        return sap.ui.getCore().getMessageManager();
      },

      getAllControls() {
        const oOpaPlugin = new OpaPlugin();
        return oOpaPlugin.getAllControls();
      },

      checkIfControlIsType(oControl, sType) {
        return (
          oControl &&
          typeof oControl.getMetadata === "function" &&
          typeof oControl.getMetadata().getName === "function" &&
          oControl.getMetadata().getName() === sType
        );
      },

      getBindingOfControl(oInput) {
        return (
          oInput.getBinding("value") ||
          oInput.getBinding("selected") ||
          oInput.getBinding("selectedKey") ||
          oInput.getBinding("dateValue")
        );
      },

      getBindingName(oInput) {
        if (oInput.getBinding("value")) {
          return "value";
        }

        if (oInput.getBinding("selected")) {
          return "selected";
        }

        if (oInput.getBinding("selectedKey")) {
          return "selectedKey";
        }

        if (oInput.getBinding("dateValue")) {
          return "dateValue";
        }

        return "";
      },

      getMessagesOfControl(oControl) {
        const oBinding = this.getBindingOfControl(oControl);
        if (!oBinding) {
          return this.getMessagesOfSmartField(oControl);
        }
        return oBinding
          .getDataState()
          .getMessages()
          .concat(this.getMessagesOfSmartField(oControl));
      },

      getMessagesOfSmartField(oInput) {
        const bIsSmartfield = this.checkIfControlIsType(
          oInput,
          "sap.ui.comp.smartfield.SmartField"
        );
        if (
          bIsSmartfield &&
          typeof oInput.getInnerControls === "function" &&
          oInput.getInnerControls().length > 0
        ) {
          const oInnerControl = oInput.getInnerControls()[0];
          const oBinding = this.getBindingOfControl(oInnerControl);
          if (oBinding) {
            return oBinding.getDataState().getMessages();
          }

          // falls das SmartField als nicht editabled oder nicht enabled ist, ist das innerControl ein sap.m.Text Control
          // die Messages dieses Controls können nicht über den DataState ausgelesen werden
          if (!oInput.getEnabled() || !oInput.getEditable()) {
            return this.getMessageModel()
              .getData()
              .filter(
                (message) =>
                  message.getTarget() === `${oInput.getId()}-input/value`
              );
          }
        }
        return [];
      },
    });
  }
);
