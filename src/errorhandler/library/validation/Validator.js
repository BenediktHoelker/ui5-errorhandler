sap.ui.define(["sap/ui/core/ValueState"], function (ValueState) {
  /**
   * Check if the control is required
   */
  function validateRequired({ control, propsToValidate }) {
    return propsToValidate
      .filter(() => control.getRequired && control.getRequired())
      .filter((prop) => control.getBinding(prop))
      .map((prop) => {
        const externalValue = control.getProperty(prop);

        if (!externalValue || externalValue === "") {
          return {
            control,
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
            valueState: ValueState.Error,
            message: "Please choose an entry!",
          };
        }
        return {
          control,
          valueState: ValueState.None,
          message: "All good",
        };
      });
  }

  function validateConstraints({ control, propsToValidate }) {
    return propsToValidate
      .filter((prop) => control.getBinding(prop))
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
            valueState: ValueState.None,
            message: "All good",
          };
        } catch (ex) {
          return {
            control,
            valueState: ValueState.Error,
            message: ex.message,
          };
        }
      });
  }

  function validateCustom({ control }) {
    return {
      control,
      valueState: control.getValueState(),
      message: control.getValueStateText(),
    };
  }

  class Validator {
    constructor() {
      this.aggregationNames = [
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
     * Recursively validates the given control and any aggregations (i.e. child controls) it may have
     */
    validate(parent) {
      sap.ui.getCore().getMessageManager().removeAllMessages();

      const invalid = this.getValidations([], parent).find(
        ({ valueState }) => valueState === ValueState.Error
      );

      if (invalid) {
        // const { control, valueState, message } = invalid;

        // control.setValueState(valueState);
        // control.setValueStateText(message);

        return false;
      }

      return true;
    }

    /**
     * Recursively validates the given control and any aggregations (i.e. child controls) it may have
     */
    getValidations(acc, control) {
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
        return acc;
      }

      if (
        typeof control.getInnerControls === "function" &&
        control.getInnerControls().length > 0
      ) {
        return this.getValidations(acc, control.getInnerControls()[0]);
      }

      if (!(typeof control.getValueState === "function")) {
        // no validation possible => yet check for aggregations

        return this.aggregationNames
          .flatMap((name) => control.getAggregation(name))
          .filter(
            (ctrl) =>
              ctrl &&
              ctrl.getEnabled &&
              ctrl.getEnabled() &&
              ctrl.getProperty &&
              ctrl.getProperty("editable")
          )
          .filter(Boolean)
          .reduce((arr, ctrl) => this.getValidations(arr, ctrl), acc);
      }

      return acc.concat(
        [
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
        ].flat()
      );
    }
  }

  return Validator;
});
