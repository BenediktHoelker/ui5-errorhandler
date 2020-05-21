sap.ui.define(["./Base", "sap/ui/model/ValidateException"], function (
  Base,
  ValidateException
) {
  return Base.extend("validationservice.library.customTypes.Boolean", {
    // eslint-disable-next-line object-shorthand
    constructor: function ({ required, resBundle }, ...args) {
      Base.apply(this, { required, resBundle }, args);

      // sap.ui.model.type.Boolean besitzt keine FormatOptions und Constraints
      this.type = new sap.ui.model.type.Boolean();
    },

    formatValue(value) {
      return this.type.formatValue(value, "boolean");
    },

    parseValue(value) {
      return this.type.parseValue(value, "boolean");
    },

    validateValue(value) {
      if (this.required && value === false) {
        throw new ValidateException(this.resBundle.getText("boolean.required"));
      } else {
        this.type.validateValue(value);
      }
    },
  });
});
