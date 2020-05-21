sap.ui.define(["./Base", "sap/ui/model/ValidateException"], function (
  BaseType,
  ValidateException
) {
  return BaseType.extend("validationservice.customTypes.PhoneNumberType", {
    // eslint-disable-next-line object-shorthand
    //  required wird über constraints abgebildet
    constructor({ constraints, required, resBundle }, ...args) {
      BaseType.apply(this, { required, resBundle }, args);

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
