sap.ui.define(["./Base", "sap/ui/model/ValidateException"], function (
  BaseType,
  ValidateException
) {
  return BaseType.extend("validationservice.library.customTypes.EmailType", {
    // eslint-disable-next-line object-shorthand
    constructor: function ({ constraints, ...options }) {
      BaseType.call(this, options);

      this.type = new sap.ui.model.type.String();
      this.type.setConstraints(constraints);
    },

    formatValue(email) {
      return this.type.formatValue(email, "string");
    },

    parseValue(email) {
      return this.type.parseValue(email, "string");
    },

    validateValue(email) {
      this.type.validateValue(email, "string");

      const bIsEmailEntered =
        email !== "" && email !== undefined && email !== null;

      if (bIsEmailEntered) {
        // Quelle: https://emailregex.com/ aufgerufen am 15.10.2019
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const isValidEmail = emailRegex.test(String(email).toLowerCase());

        if (!isValidEmail) {
          const errorText = this.resBundle.getText("email.invalid");
          throw new ValidateException(errorText);
        }
      }
    },
  });
});
