sap.ui.define(["./Base", "sap/ui/model/ValidateException"], function (
  BaseType,
  ValidateException
) {
  return BaseType.extend("validationservice.customTypes.PhoneNumberType", {
    //  required wird über constraints abgebildet
    // eslint-disable-next-line object-shorthand
    constructor: function ({ constraints, ...options }) {
      BaseType.call(this, options);

      this.type = new sap.ui.model.type.String();
      this.type.setConstraints(constraints);
    },

    formatValue(phone) {
      return this.type.formatValue(phone, "string");
    },

    parseValue(phone) {
      return this.type.parseValue(phone, "string");
    },

    validateValue(phone) {
      this.type.validateValue(phone, "string");

      const phoneIsEntered =
        phone !== "" && phone !== undefined && phone !== null;

      if (phoneIsEntered) {
        const PhoneRegex = /^[+-\s()./0-9]{5,20}$/;
        const isValidPhoneNumber = PhoneRegex.test(phone);

        if (!isValidPhoneNumber) {
          const phoneErrorText = this.resBundle.getText("phone.invalid");
          throw new ValidateException(phoneErrorText);
        }
      }
    },
  });
});
