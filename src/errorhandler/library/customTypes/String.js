sap.ui.define(["./Base"], function (BaseType) {
  return BaseType.extend("validationservice.customTypes.StringType", {
    // eslint-disable-next-line object-shorthand
    constructor: function ({ constraints, ...options }) {
      BaseType.call(this, options);

      this.type = new sap.ui.model.type.String();
      this.type.setConstraints(constraints);
    },

    formatValue(string) {
      return this.type.formatValue(string, "string");
    },

    parseValue(string) {
      return this.type.parseValue(string, "string");
    },

    validateValue(string) {
      this.type.validateValue(string, "string");
    },
  });
});
