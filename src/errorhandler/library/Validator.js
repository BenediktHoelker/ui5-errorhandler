sap.ui.define(
  [
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType",
    "sap/ui/core/ValueState",
  ],
  function (Message, MessageType, ValueState) {
    function getRequired(control) {
      return control.getRequired && control.getRequired();
    }

    function getEditable(control) {
      return control.getProperty && control.getProperty("editable");
    }

    function getEnabled(control) {
      return control.getEnabled && control.getEnabled();
    }

    function getVisible(control) {
      return control.getVisible && control.getVisible();
    }

    function getValueState(control) {
      return control.getValueState ? control.getValueState() : "None";
    }

    function getValueStateText(control) {
      return control.getValueStateText ? control.getValueStateText() : "None";
    }

    function getHasInnerControls(control) {
      return control.getInnerControls && control.getInnerControls().length > 0;
    }

    function getValidationContext(control, prop) {
      return {
        control,
        binding: control.getBinding(prop),
        externalValue: control.getProperty(prop),
        prop,
        valueState: getValueState(control),
        valueStateText: getValueStateText(control),
      };
    }

    function validateRequired({ control, propsToValidate }) {
      if (!getRequired(control)) {
        return [];
      }

      return propsToValidate
        .filter((prop) => control.getBinding(prop))
        .map((prop) => getValidationContext(control, prop))
        .map((vldContext) => {
          const { externalValue } = vldContext;

          if (!externalValue || externalValue === "") {
            return {
              ...vldContext,
              valueState: ValueState.Error,
              valueStateText: "The field is required but empty => error",
            };
          }
          if (
            control.getAggregation("picker") &&
            control.getProperty("selectedKey").length === 0
          ) {
            // might be a select
            return {
              ...vldContext,
              valueState: ValueState.Error,
              message: "Please choose an entry!",
            };
          }
          return {
            ...vldContext,
            valueState: ValueState.None,
            valueStateText: "The field is required and filled => good",
          };
        });
    }

    function validateConstraints({ control, propsToValidate }) {
      if (!getEnabled(control) || !getEditable(control)) {
        return [];
      }

      return propsToValidate
        .filter((prop) => control.getBinding(prop))
        .map((prop) => getValidationContext(control, prop))
        .map((vldContext) => {
          try {
            const { binding, externalValue } = vldContext;
            const type = binding.getType();

            if (!type) {
              return {
                ...vldContext,
                message: "No field constraints set => good",
              };
            }

            const internalValue = type.parseValue(
              externalValue,
              binding.sInternalType
            );

            type.validateValue(internalValue);

            return {
              ...vldContext,
              message: "All field-constraints are met => good",
            };
          } catch (ex) {
            return {
              ...vldContext,
              valueState: ValueState.Error,
              message: ex.message,
            };
          }
        });
    }

    function convertValueStateToMessageType(valueState = ValueState.Error) {
      Object.entries(ValueState)
        .filter(([...value]) => value === valueState)
        .map(([key]) => MessageType[key]);
    }

    function getLabel(control) {
      switch (control.getMetadata().getName()) {
        case "sap.m.CheckBox":
        case "sap.m.Input":
        case "sap.m.Select": {
          const parent = control.getParent();
          return parent.getLabel
            ? parent.getLabel().getText()
            : parent.getParent().getLabel().getText();
        }
        default:
          return "";
      }
    }

    function createMessage({
      control,
      valueState,
      valueStateText,
      type = convertValueStateToMessageType(valueState),
      message = valueStateText,
      additionalText = getLabel(control),
    }) {
      return new Message({
        message,
        type,
        additionalText,
      });
    }

    function updateUI(validations) {
      const messageManager = sap.ui.getCore().getMessageManager();
      const validationsByControl = new Map(
        // Reduce all validations into one per control
        validations
          .sort((a, b) => a.valueState.localeCompare(b.valueState))
          // Sort descending by valueState in order to overwrite "None" with "Error", in case both are present for one control
          .reverse()
          .map((validation) => [validation.control.getId(), validation])
      );

      // messageManager.removeAllMessages();

      validationsByControl.forEach(
        ({ control, valueState, valueStateText }) => {
          control.setValueState(valueState);
          control.setValueStateText(valueStateText);
        }
      );

      Array.from(validationsByControl.values())
        .filter(({ valueState }) => valueState === ValueState.Error)
        .map((validation) => createMessage(validation))
        .forEach((message) => messageManager.addMessages(message));
    }

    class Validator {
      constructor() {
        this.possibleAggregations = [
          "items",
          "steps",
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
        this.propsToValidate = ["value", "selectedKey", "selected", "text"]; // yes, I want to validate Select and Text controls too
      }

      /**
       * Recursively validates the given control and any aggregations (i.e. child controls) it may have
       * Input 1..n controls (e.g. the n active Wizard-Steps)
       */
      validate(parents) {
        const validations = [parents]
          // parents can be an array or a single control
          .flat()
          .reduce((acc, curr) => acc.concat(this.getValidations([], curr)), []);

        // updateUI(validations);

        return validations.every(
          ({ valueState }) => valueState !== ValueState.Error
        );
      }

      /**
       * Recursively validates the given control and any aggregations (i.e. child controls) it may have
       */
      getValidations(
        acc,
        control,
        propsToValidate = this.propsToValidate,
        possibleAggregations = this.possibleAggregations
      ) {
        // only validate controls and elements which have a 'visible' property
        // and are visible controls (invisible controls make no sense checking)
        if (!getVisible(control)) {
          return acc;
        }

        if (getHasInnerControls(control)) {
          return this.getValidations(acc, control.getInnerControls()[0]);
        }

        if (!control.getValueState) {
          // no validation possible => yet check for aggregations

          return possibleAggregations
            .flatMap((name) => control.getAggregation(name))
            .filter(Boolean)
            .reduce((arr, ctrl) => this.getValidations(arr, ctrl), acc);
        }

        return acc
          .concat(
            validateRequired({
              control,
              propsToValidate,
            }),
            validateConstraints({
              control,
              propsToValidate,
            })
          )
          .flat();
      }
    }

    return Validator;
  }
);
