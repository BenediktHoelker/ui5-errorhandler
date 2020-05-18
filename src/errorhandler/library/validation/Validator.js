sap.ui.define(
  [
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType",
    "sap/ui/core/ValueState",
  ],
  function (Message, MessageType, ValueState) {
    /**
     * Set ValueState and ValueStateText of the control
     */
    function setValueState(control, valueState, text) {
      control.setValueState(valueState);
      if (control.getValueStateText && !control.getValueStateText()) {
        control.setValueStateText(text);
      }
    }

    /**
     * Recursively calls the function on all the children of the aggregation
     */
    function convertValueStateToMessageType(valueState = ValueState.Error) {
      Object.entries(ValueState)
        .filter(([...value]) => value === valueState)
        .map(([key]) => MessageType[key]);
    }

    function getLabel(control) {
      switch (control.getMetadata().getName()) {
        case "sap.m.CheckBox":
        case "sap.m.Input":
        case "sap.m.Select":
          return control.getParent().getLabel().getText();
        default:
          return "";
      }
    }

    /**
     * Check if the control property has a data type, then returns the index of the property to validate
     */
    function hasType({ control, properties }) {
      return properties.some(
        (prop) => control.getBinding(prop) && control.getBinding(prop).getType()
      );
    }

    /**
     * Add message to the MessageManager
     */
    function addMessage(
      control,
      message = "Wrong input",
      label = getLabel(control)
    ) {
      sap.ui
        .getCore()
        .getMessageManager()
        .addMessages(
          new Message({
            message:
              typeof control.getValueStateText === "function"
                ? control.getValueStateText()
                : message,
            type:
              typeof control.getValueState === "function"
                ? convertValueStateToMessageType(control.getValueState())
                : MessageType.Error,
            additionalText: label,
          })
        );
    }

    /**
     * Recursively calls the function on all the children of the aggregation
     */
    function recursiveCall({ control, perform, aggregationNames }) {
      aggregationNames
        .flatMap((name) => control.getAggregation(name))
        .forEach((aggregation) => perform(aggregation));
    }

    /**
     * Check if the control is required
     */
    function validateRequired({ control, propsToValidate }) {
      return propsToValidate
        .filter((prop) => control.getBinding(prop))
        .map((prop) => {
          const externalValue = control.getProperty(prop);

          if (!externalValue || externalValue === "") {
            return {
              control,
              valid: false,
              valueState: ValueState.Error,
              message: "Please fill this mandatory field!",
            };
          }
          if (
            control.getAggregation("picker") &&
            control.getProperty("selectedKey").length === 0
          ) {
            // might be a select
            return {
              control,
              valid: false,
              valueState: ValueState.Error,
              message: "Please choose an entry!",
            };
          }
          return {
            control,
            valid: true,
            valueState: ValueState.None,
            message: "All good",
          };
        });
    }

    function validateConstraints({ control, propsToValidate }) {
      return propsToValidate
        .filter(
          (prop) => control.getBinding(prop) && control.getProperty("editable")
        )
        .map((prop) => {
          try {
            const binding = control.getBinding(prop);
            const externalValue = control.getProperty(prop);
            const internalValue = binding
              .getType()
              .parseValue(externalValue, binding.sInternalType);

            binding.getType().validateValue(internalValue);

            return {
              control,
              valid: true,
              valueState: ValueState.None,
              message: "All good",
            };
          } catch (ex) {
            return {
              control,
              valid: false,
              valueState: ValueState.Error,
              message: ex.message,
            };
          }
        });
    }

    function validateCustom(control) {
      if (control.getValueState && control.getValueState() === ValueState.Error)
        return {
          control,
          valid: false,
          valueState: ValueState.Error,
          message: control.getValueStateText() || "Wrong input",
        };
    }

    class Validator {
      constructor() {
        this.isValid = true;
        this.isValidationPerformed = false;
        this.possibleAggregations = [
          "items",
          "content",
          "form",
          "formContainers",
          "formElements",
          "fields",
          "sections",
          "subSections",
          "grid",
          "cells",
          "page",
        ];
        this.validateProperties = ["value", "selectedKey", "text"]; // yes, I want to validate Select and Text controls too
      }

      /**
       * Returns true only when the form validation has been performed, and no validation errors were found
       */
      isValid() {
        return this.isValidationPerformed && this.isValid;
      }

      /**
       * Recursively validates the given control and any aggregations (i.e. child controls) it may have
       */
      validate(control) {
        this.isValid = true;
        sap.ui.getCore().getMessageManager().removeAllMessages();
        this._validate(control);

        return this.isValid();
      }

      clearValueState(control) {
        if (!control) return;
        if (control.setValueState) control.setValueState(ValueState.None);

        recursiveCall({
          control,
          perform: this.clearValueState,
          aggregationNames: this.possibleAggregations,
        });
      }

      /**
       * Recursively validates the given control and any aggregations (i.e. child controls) it may have
       */
      _validate(control) {
        const isValidatedControl = true;
        const isValid = true;

        // only validate controls and elements which have a 'visible' property
        // and are visible controls (invisible controls make no sense checking)
        if (
          !(
            (control instanceof sap.ui.core.Control ||
              control instanceof sap.ui.layout.form.FormContainer ||
              control instanceof sap.ui.layout.form.FormElement ||
              control instanceof sap.m.IconTabFilter) &&
            control.getVisible()
          )
        ) {
          return;
        }

        const validatons = [
          validateRequired({
            control,
            propsToValidate: this.validateProperties,
          }),
          validateConstraints({
            control,
            propsToValidate: this.validateProperties,
          }),
          validateCustom({
            control,
            propsToValidate: this.validateProperties,
          }),
        ];

        if (!isValid) {
          this.isValid = false;
          addMessage(control);
        }

        // if the control could not be validated, it may have aggregations
        if (!isValidatedControl) {
          this.recursiveCall(control, this.validate);
        }

        this.isValidationPerformed = true;
      }
    }

    return Validator;
  }
);
