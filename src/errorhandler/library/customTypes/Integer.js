sap.ui.define(["./Base", "sap/ui/model/ValidateException"], function (
  BaseType,
  ValidateException
) {
  return BaseType.extend("validationservice.library.customTypes.IntegerType", {
    // eslint-disable-next-line object-shorthand
    constructor: function (
      {
        constraints,
        formatOptions,
        invalidValues = [],
        range,
        required,
        resBundle,
      } = {},
      ...args
    ) {
      BaseType.apply(this, { required, resBundle }, args);

      this.type = new sap.ui.model.type.Integer();

      if (formatOptions) this.type.setFormatOptions(formatOptions);
      if (constraints) this.type.setConstraints(constraints);

      this.range = range;
      this.invalidValues = invalidValues;
    },

    formatValue(integer) {
      return this.type.formatValue(integer, "string");
    },

    parseValue(integer) {
      // Die Funktion 'parseValue' der Klasse 'sap.ui.model.type.Integer' wirft immer einen Error wenn kein Integer übergeben wird
      // sap.ui.model.type.Integer wäre somit immer required
      if (this.required || integer !== "") {
        return this.type.parseValue(integer, "string");
      }
      return NaN;
    },

    validateValue(integer) {
      const resBundle = sap.ui.getCore().getLibraryResourceBundle();

      if (!integer) {
        const invalidLengthMessage = resBundle.getText("EnterInt");
        throw new ValidateException(invalidLengthMessage);
      }

      const isNotValidValue = this.invalidValues.some((notValidValue) => {
        return notValidValue === integer;
      });

      if (isNotValidValue) {
        const integerValue = integer.toString();
        // "Der Wert {0} ist ungültig"
        const invalidValueMessage = this.resBundle.getText(
          "value.invalid",
          integerValue
        );
        throw new ValidateException(invalidValueMessage);
      }

      if (
        typeof this.range === "object" &&
        typeof this.range.minimum === "number" &&
        integer < this.range.minimum
      ) {
        // "Geben Sie eine Zahl größer oder gleich {0} ein"
        const lessThanMinMessage = resBundle.getText(
          "Integer.Minimum",
          this.range.minimum.toString()
        );
        throw new ValidateException(lessThanMinMessage);
      }

      if (
        typeof this.range === "object" &&
        typeof this.range.maximum === "number" &&
        integer > this.range.maximum
      ) {
        // "Geben Sie eine Zahl kleiner oder gleich {0} ein"
        const moreThanMaxMessage = resBundle.getText(
          "Integer.Maximum",
          this.range.maximum.toString()
        );
        throw new ValidateException(moreThanMaxMessage);
      }

      this.type.validateValue(integer);
    },
  });
});
