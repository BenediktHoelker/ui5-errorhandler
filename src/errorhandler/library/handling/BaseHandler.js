sap.ui.define(
  ["sap/ui/test/OpaPlugin", "sap/ui/model/resource/ResourceModel"],
  function (OpaPlugin, ResourceModel) {
    return {
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
        const OPAPlugin = new OpaPlugin();
        return OPAPlugin.getAllControls();
      },

      checkIfControlIsType(control, sType) {
        return (
          control &&
          typeof control.getMetadata === "function" &&
          typeof control.getMetadata().getName === "function" &&
          control.getMetadata().getName() === sType
        );
      },

      getBindingOfControl(control) {
        return (
          control.getBinding("value") ||
          control.getBinding("selected") ||
          control.getBinding("selectedKey") ||
          control.getBinding("dateValue")
        );
      },

      getBindingName(control) {
        if (control.getBinding("value")) {
          return "value";
        }

        if (control.getBinding("selected")) {
          return "selected";
        }

        if (control.getBinding("selectedKey")) {
          return "selectedKey";
        }

        if (control.getBinding("dateValue")) {
          return "dateValue";
        }

        return "";
      },

      getMessagesOfControl(control) {
        const binding = this.getBindingOfControl(control);
        if (!binding) {
          return this.getMessagesOfSmartField(control);
        }
        return binding
          .getDataState()
          .getMessages()
          .concat(this.getMessagesOfSmartField(control));
      },

      getMessagesOfSmartField(control) {
        const isSmartField = this.checkIfControlIsType(
          control,
          "sap.ui.comp.smartfield.SmartField"
        );
        if (
          isSmartField &&
          typeof control.getInnerControls === "function" &&
          control.getInnerControls().length > 0
        ) {
          const innerControl = control.getInnerControls()[0];
          const binding = this.getBindingOfControl(innerControl);
          if (binding) {
            return binding.getDataState().getMessages();
          }

          // falls das SmartField als nicht editabled oder nicht enabled ist, ist das innerControl ein sap.m.Text Control
          // die Messages dieses Controls können nicht über den DataState ausgelesen werden
          if (!control.getEnabled() || !control.getEditable()) {
            return this.getMessageModel()
              .getData()
              .filter(
                (message) =>
                  message.getTarget() === `${control.getId()}-input/value`
              );
          }
        }
        return [];
      },
    };
  }
);
