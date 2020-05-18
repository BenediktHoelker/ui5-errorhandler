sap.ui.define(["sap/ui/base/Object"], function (BaseObject) {
  return BaseObject.extend("validationservice.library.validation.Base", {
    checkFormIsValid(form) {
      // bei einem BlockLayout müssen alle Cells valide sein
      if (form.getMetadata().getElementName() === "sap.ui.layout.BlockLayout") {
        form
          .getContent()
          .flatMap((row) => row.getContent())
          .every((cell) => this.checkContentIsValid(cell));
      }

      return this.checkContentIsValid(form);
    },

    checkContentIsValid(step) {
      const formsAreValid = this.getSimpleForms(step).every((form) =>
        this.checkFormIsValid(form)
      );

      const tablesAreValid = this.getTables(step).every((table) =>
        this.checkTableIsValid(table)
      );

      return formsAreValid && tablesAreValid;
    },

    getVisibleInputsInContent(oParentControl) {
      return this.getInputControlsInContent(oParentControl).filter((oInput) =>
        typeof oInput.getVisible === "function" ? oInput.getVisible() : true
      );
    },

    getInputControlsInContent(oParentControl) {
      const aContent = this.getContent(oParentControl);
      const aControlsInBoxes = this.getControlsInBoxes(aContent);
      const aControls = aContent.concat(aControlsInBoxes);

      return this.filterControls(aControls, [
        "sap.m.DatePicker",
        "sap.m.Input",
        "sap.m.Select",
        "sap.ui.comp.smartfield.SmartField",
        "sap.m.ComboBox",
        "sap.m.RatingIndicator",
        "sap.m.TextArea",
        "sap.m.CheckBox",
        "sap.m.StepInput",
      ]);
    },

    getContent(oParentControl) {
      if (typeof oParentControl.getContent === "function") {
        return oParentControl.getContent();
      }
      if (typeof oParentControl.getCells === "function") {
        return oParentControl.getCells();
      }
      return [];
    },

    getControlsInBoxes(aControls) {
      let aControlsInBoxes = [];
      const aBoxes = this.getBoxes(aControls);

      if (aBoxes.length === 0) {
        return [];
      }

      aBoxes.forEach((box) => {
        aControlsInBoxes = aControlsInBoxes.concat(this.getContentOfBox(box));
      });
      aControlsInBoxes = Array.prototype.concat.apply([], aControlsInBoxes);

      // ermittle auch die Controls in geschachtelten Boxen => rekursiv
      aControlsInBoxes = aControlsInBoxes.concat(
        this.getControlsInBoxes(aControlsInBoxes)
      );

      return aControlsInBoxes;
    },

    getBoxes(aControls) {
      return aControls.filter((control) => {
        const sElementName = control.getMetadata().getElementName();
        return (
          sElementName === "sap.m.HBox" ||
          sElementName === "sap.m.VBox" ||
          sElementName === "sap.ui.layout.VerticalLayout" ||
          sElementName === "sap.ui.layout.HorizontalLayout"
        );
      });
    },

    getContentOfBox(oBox) {
      if (typeof oBox.getItems === "function") {
        return oBox.getItems();
      }
      if (typeof oBox.getContent === "function") {
        return oBox.getContent();
      }
      return [];
    },

    filterControls(aInputControls, aNames) {
      return aInputControls.filter((control) =>
        aNames.includes(control.getMetadata().getName())
      );
    },

    getMessagesOfControl(control) {
      const binding = this.getBindingOfControl(control);

      if (binding) {
        return binding
          .getDataState()
          .getMessages()
          .concat(this.getMessagesOfSmartField(control));
      }

      // Messages die mit CustomValidations hinzugefügt wurden
      const targetMessages = sap.ui
        .getCore()
        .getMessageManager()
        .getMessageModel()
        .getData()
        .filter((msg) => msg.getTarget() === control.getId());

      if (targetMessages.length > 0) {
        return targetMessages;
      }

      return this.getMessagesOfSmartField(control);
    },

    getBindingOfControl(oInput) {
      return (
        oInput.getBinding("value") ||
        oInput.getBinding("selected") ||
        oInput.getBinding("selectedKey") ||
        oInput.getBinding("dateValue")
      );
    },

    getMessagesOfSmartField(oInput) {
      const bIsSmartfield = this.checkControlIsType(
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
          return sap.ui
            .getCore()
            .getMessageManager()
            .getMessageModel()
            .getData()
            .filter(
              (message) =>
                message.getTarget() === `${oInput.getId()}-input/value`
            );
        }
      }
      return [];
    },

    registerDialog(dialog) {
      dialog.attachAfterClose(() =>
        this.getSimpleFormsInDialog(dialog).forEach((form) =>
          this.removeValidationMessages(form)
        )
      );
    },

    getSimpleFormsInDialog(dialog) {
      return dialog
        .getContent()
        .filter((control) => this.checkIsSimpleForm(control));
    },

    removeValidationMessages(form) {
      const messageManager = sap.ui.getCore().getMessageManager();

      this.getVisibleInputsInContent(form).forEach((input) =>
        messageManager.removeMessages(this.getMessagesOfControl(input))
      );
    },

    getSimpleForms(step) {
      return step.getContent().flatMap((content) => {
        switch (content) {
          case this.checkIsSimpleForm(content):
            return content;
          case this.checkIsView(content):
            return this.getSimpleForms(content);
          case this.checkIsComponentContainer(content):
            return this.getSimpleForms(this.getComponentContainer(content));
          default:
            return [];
        }
      });
    },

    getTables(step) {
      return step.getContent().flatMap((content) => {
        switch (content) {
          case this.checkIsTable(content):
            return content;
          case this.checkIsView(content):
            return this.getTables(content);
          case this.checkIsComponentContainer(content):
            return this.getTables(this.getComponentContainer(content));
          default:
            return [];
        }
      });
    },

    getComponentContainer(step) {
      return step
        .getContent()
        .map((container) => container.getComponentInstance().getCurrentView());
    },

    checkIsSimpleForm(control) {
      return this.checkControlIsType(control, "sap.ui.layout.form.SimpleForm");
    },

    checkIsView(control) {
      return this.checkControlIsType(control, "sap.ui.core.mvc.XMLView");
    },

    checkIsComponentContainer(control) {
      return this.checkControlIsType(control, "sap.ui.core.ComponentContainer");
    },

    checkIsTable(control) {
      return this.checkControlIsType(control, "sap.m.Table");
    },
  });
});
