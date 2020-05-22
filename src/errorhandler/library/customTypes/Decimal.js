sap.ui.define(["./Base", "sap/ui/model/ValidateException"], function (
  BaseType,
  ValidateException
) {
  return BaseType.extend("validationservice.library.customTypes.DecimalType", {
    // eslint-disable-next-line object-shorthand
    constructor: function ({
      formatOptions,
      constraints,
      invalidValues,
      ...options
    }) {
      BaseType.call(this, options);

      this.type = new sap.ui.model.odata.type.Decimal(
        formatOptions,
        constraints
      );

      const { minimum, maximum } = constraints;

      this.minimum = minimum;
      this.maximum = maximum;
      this.invalidValues = invalidValues;
    },

    formatValue(decimal) {
      return this.type.formatValue(decimal, "int");
    },

    parseValue(decimal) {
      return this.type.parseValue(decimal, "int");
    },

    validateValue(value) {
      const decimalValue = Number.parseFloat(value);
      const isInvalid = this.invalidValues.some((invalidValue) => {
        return invalidValue === decimalValue;
      });

      if (isInvalid) {
        // "Der Wert {0} ist ungültig"
        throw new ValidateException(
          this.resBundle.getText("value.invalid", value)
        );
      }

      if (this.minimum > decimalValue) {
        throw new ValidateException(
          sap.ui
            .getCore()
            .getLibraryResourceBundle()
            .getText("Float.Minimum", this.minimum)
        );
      }

      if (this.maximum < decimalValue) {
        throw new ValidateException(
          sap.ui
            .getCore()
            .getLibraryResourceBundle()
            .getText("Float.Maximum", this.maximum)
        );
      }

      this.type.validateValue(value);
    },
  });
});
