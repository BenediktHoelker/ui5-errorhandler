sap.ui.define(["./Base", "sap/ui/model/ValidateException"], function (
  BaseType,
  ValidateException
) {
  return BaseType.extend("validationservice.library.customTypes.RatingType", {
    // eslint-disable-next-line object-shorthand
    constructor: function ({ formatOptions, constraints, ...options }) {
      BaseType.call(this, options);

      this.type = new sap.ui.model.type.Float();

      if (formatOptions) this.type.setFormatOptions(formatOptions);
      if (constraints) this.type.setConstraints(constraints);
    },

    formatValue(rating) {
      return this.type.formatValue(rating, "float");
    },

    parseValue(rating) {
      return this.type.parseValue(rating, "float");
    },

    validateValue(rating) {
      if (this.required && rating === 0) {
        const ratingRequiredText = this.resBundle.getText("rating.required");
        throw new ValidateException(ratingRequiredText);
      } else {
        this.type.validateValue(rating);
      }
    },
  });
});
