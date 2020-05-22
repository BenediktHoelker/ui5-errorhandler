sap.ui.define(["./Base", "sap/ui/model/ValidateException"], function (
  BaseType,
  ValidateException
) {
  return BaseType.extend("validationservice.library.customTypes.Currency", {
    // eslint-disable-next-line object-shorthand
    constructor: function ({
      formatOptions,
      constraints,
      invalidValues = [],
      ...options
    }) {
      BaseType.call(this, options);

      this.type = new sap.ui.model.type.Currency();
      this.type.setFormatOptions(formatOptions);
      this.type.setConstraints(constraints);

      this.currencyWithDescription = [];
      this.invalidValues = invalidValues;
    },

    formatValue(currency) {
      return this.type.formatValue([currency, ""], "string");
    },

    parseValue(currency) {
      this.currencyWithDescription = this.type.parseValue(currency, "string");

      // nur der Wert der Currency, ohne Einheit wird im Model als String gespeichert
      return Number.parseFloat(this.currencyWithDescription[0]).toFixed(2);
    },

    validateValue(value) {
      const isInvalid = this.invalidValues.some(
        (invalidValue) => invalidValue === Number.parseFloat(value)
      );

      if (isInvalid) {
        throw new ValidateException(
          this.resBundle.getText("value.invalid", value)
        );
      }

      // falls kein Wert angegeben wurde ist isNaN("") => true
      if (this.required && !value) {
        // "Geben Sie einen Wert mit mindestens {0} Zeichen ein"
        throw new ValidateException(
          sap.ui
            .getCore()
            .getLibraryResourceBundle()
            .getText("String.MinLength", "1")
        );
      } else {
        this.type.validateValue(this.currencyWithDescription);
      }
    },
  });
});
