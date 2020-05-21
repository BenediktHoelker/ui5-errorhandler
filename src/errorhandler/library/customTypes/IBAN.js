sap.ui.define(["./Base", "sap/ui/model/ValidateException"], function (
  BaseType,
  ValidateException
) {
  /**
   * Validierung basierend auf https://github.com/Simplify/IBANtools/blob/master/dist/IBANtools.js, aufgerufen 04/2019
   */
  const countrySpecs = {
    AD: {
      chars: 24,
      IBANRegex: "^[0-9]{8}[A-Z0-9]{12}$",
    },
    AE: {
      chars: 23,
      IBANRegex: "^[0-9]{3}[0-9]{16}$",
    },
    AL: {
      chars: 28,
      IBANRegex: "^[0-9]{8}[A-Z0-9]{16}$",
    },
    AT: {
      chars: 20,
      IBANRegex: "^[0-9]{16}$",
    },
    AX: {
      chars: 18,
      IBANRegex: "^[0-9]{14}$",
    },
    AZ: {
      chars: 28,
      IBANRegex: "^[A-Z]{4}[0-9]{20}$",
    },
    BA: {
      chars: 20,
      IBANRegex: "^[0-9]{16}$",
    },
    BE: {
      chars: 16,
      IBANRegex: "^[0-9]{12}$",
    },
    BG: {
      chars: 22,
      IBANRegex: "^[A-Z]{4}[0-9]{6}[A-Z0-9]{8}$",
    },
    BH: {
      chars: 22,
      IBANRegex: "^[A-Z]{4}[A-Z0-9]{14}$",
    },

    BL: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
    BR: {
      chars: 29,
      IBANRegex: "^[0-9]{23}[A-Z]{1}[A-Z0-9]{1}$",
    },
    BY: {
      chars: 28,
      IBANRegex: "^[A-Z]{4}[0-9]{4}[A-Z0-9]{16}$",
    },
    CH: {
      chars: 21,
      IBANRegex: "^[0-9]{5}[A-Z0-9]{12}$",
    },
    CR: {
      chars: 22,
      IBANRegex: "^[0-9]{18}$",
    },
    CY: {
      chars: 28,
      IBANRegex: "^[0-9]{8}[A-Z0-9]{16}$",
    },
    CZ: {
      chars: 24,
      IBANRegex: "^[0-9]{20}$",
    },
    DE: {
      chars: 22,
      IBANRegex: "^[0-9]{18}$",
    },
    DK: {
      chars: 18,
      IBANRegex: "^[0-9]{14}$",
    },
    DO: {
      chars: 28,
      IBANRegex: "^[A-Z]{4}[0-9]{20}$",
    },
    EE: {
      chars: 20,
      IBANRegex: "^[0-9]{16}$",
    },
    ES: {
      chars: 24,
      IBANRegex: "^[0-9]{20}$",
    },
    FI: {
      chars: 18,
      IBANRegex: "^[0-9]{14}$",
    },
    FO: {
      chars: 18,
      IBANRegex: "^[0-9]{14}$",
    },
    FR: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
    GB: {
      chars: 22,
      IBANRegex: "^[A-Z]{4}[0-9]{14}$",
    },
    GE: {
      chars: 22,
      IBANRegex: "^[A-Z0-9]{2}[0-9]{16}$",
    },
    GF: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
    GI: {
      chars: 23,
      IBANRegex: "^[A-Z]{4}[A-Z0-9]{15}$",
    },
    GL: {
      chars: 18,
      IBANRegex: "^[0-9]{14}$",
    },
    GP: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
    GR: {
      chars: 27,
      IBANRegex: "^[0-9]{7}[A-Z0-9]{16}$",
    },
    GT: {
      chars: 28,
      IBANRegex: "^[A-Z0-9]{24}$",
    },
    HR: {
      chars: 21,
      IBANRegex: "^[0-9]{17}$",
    },
    HU: {
      chars: 28,
      IBANRegex: "^[0-9]{24}$",
    },
    IE: {
      chars: 22,
      IBANRegex: "^[A-Z0-9]{4}[0-9]{14}$",
    },
    IL: {
      chars: 23,
      IBANRegex: "^[0-9]{19}$",
    },
    IQ: {
      chars: 23,
      IBANRegex: "^[A-Z]{4}[0-9]{15}$",
    },
    IS: {
      chars: 26,
      IBANRegex: "^[0-9]{22}$",
    },
    IT: {
      chars: 27,
      IBANRegex: "^[A-Z]{1}[0-9]{10}[A-Z0-9]{12}$",
    },
    JO: {
      chars: 30,
      IBANRegex: "^[A-Z]{4}[0-9]{4}[A-Z0-9]{18}$",
    },
    KW: {
      chars: 30,
      IBANRegex: "^[A-Z]{4}[A-Z0-9]{22}$",
    },
    KZ: {
      chars: 20,
      IBANRegex: "^[0-9]{3}[A-Z0-9]{13}$",
    },
    LB: {
      chars: 28,
      IBANRegex: "^[0-9]{4}[A-Z0-9]{20}$",
    },
    LC: {
      chars: 32,
      IBANRegex: "^[A-Z]{4}[A-Z0-9]{24}$",
    },
    LI: {
      chars: 21,
      IBANRegex: "^[0-9]{5}[A-Z0-9]{12}$",
    },
    LT: {
      chars: 20,
      IBANRegex: "^[0-9]{16}$",
    },
    LU: {
      chars: 20,
      IBANRegex: "^[0-9]{3}[A-Z0-9]{13}$",
    },
    LV: {
      chars: 21,
      IBANRegex: "^[A-Z]{4}[A-Z0-9]{13}$",
    },
    MC: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
    MD: {
      chars: 24,
      IBANRegex: "^[A-Z0-9]{2}[A-Z0-9]{18}$",
    },
    ME: {
      chars: 22,
      IBANRegex: "^[0-9]{18}$",
    },
    MF: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
    MK: {
      chars: 19,
      IBANRegex: "^[0-9]{3}[A-Z0-9]{10}[0-9]{2}$",
    },
    MQ: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
    MR: {
      chars: 27,
      IBANRegex: "^[0-9]{23}$",
    },
    MT: {
      chars: 31,
      IBANRegex: "^[A-Z]{4}[0-9]{5}[A-Z0-9]{18}$",
    },
    MU: {
      chars: 30,
      IBANRegex: "^[A-Z]{4}[0-9]{19}[A-Z]{3}$",
    },
    NC: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
    NL: {
      chars: 18,
      IBANRegex: "^[A-Z]{4}[0-9]{10}$",
    },
    NO: {
      chars: 15,
      IBANRegex: "^[0-9]{11}$",
    },
    PF: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
    PK: {
      chars: 24,
      IBANRegex: "^[A-Z0-9]{4}[0-9]{16}$",
    },
    PL: {
      chars: 28,
      IBANRegex: "^[0-9]{24}$",
    },
    PM: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
    PS: {
      chars: 29,
      IBANRegex: "^[A-Z0-9]{4}[0-9]{21}$",
    },
    PT: {
      chars: 25,
      IBANRegex: "^[0-9]{21}$",
    },
    QA: {
      chars: 29,
      IBANRegex: "^[A-Z]{4}[A-Z0-9]{21}$",
    },
    RE: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
    RO: {
      chars: 24,
      IBANRegex: "^[A-Z]{4}[A-Z0-9]{16}$",
    },
    RS: {
      chars: 22,
      IBANRegex: "^[0-9]{18}$",
    },
    SA: {
      chars: 24,
      IBANRegex: "^[0-9]{2}[A-Z0-9]{18}$",
    },
    SC: {
      chars: 31,
      IBANRegex: "^[[A-Z]{4}[]0-9]{20}[A-Z]{3}$",
    },
    SE: {
      chars: 24,
      IBANRegex: "^[0-9]{20}$",
    },
    SI: {
      chars: 19,
      IBANRegex: "^[0-9]{15}$",
    },
    SK: {
      chars: 24,
      IBANRegex: "^[0-9]{20}$",
    },
    SM: {
      chars: 27,
      IBANRegex: "^[A-Z]{1}[0-9]{10}[A-Z0-9]{12}$",
    },
    ST: {
      chars: 25,
      IBANRegex: "^[0-9]{21}$",
    },
    SV: {
      chars: 28,
      IBANRegex: "^[A-Z]{4}[0-9]{20}$",
    },
    TF: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
    TL: {
      chars: 23,
      IBANRegex: "^[0-9]{19}$",
    },
    TN: {
      chars: 24,
      IBANRegex: "^[0-9]{20}$",
    },
    TR: {
      chars: 26,
      IBANRegex: "^[0-9]{5}[A-Z0-9]{17}$",
    },
    UA: {
      chars: 29,
      IBANRegex: "^[0-9]{6}[A-Z0-9]{19}$",
    },
    VG: {
      chars: 24,
      IBANRegex: "^[A-Z0-9]{4}[0-9]{16}$",
    },
    WF: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
    XK: {
      chars: 20,
      IBANRegex: "^[0-9]{16}$",
    },
    YT: {
      chars: 27,
      IBANRegex: "^[0-9]{10}[A-Z0-9]{11}[0-9]{2}$",
    },
  };

  function checkFormatIBAN(IBAN, IBANRegex) {
    const sRegex = new RegExp(IBANRegex, "");
    return sRegex.test(IBAN);
  }

  function testCheckDigit(IBAN) {
    const transformedIBAN = IBAN.slice(3) + IBAN.slice(0, 4);
    let validationString = "";
    for (let i = 1; i < transformedIBAN.length; i += 1) {
      const iCharCode = transformedIBAN.charCodeAt(i);
      if (iCharCode >= 65) {
        validationString += (iCharCode - 55).toString();
      } else {
        validationString += transformedIBAN[i];
      }
    }
    while (validationString.length > 2) {
      const part = validationString.slice(0, 6);
      validationString =
        (parseInt(part, 10) % 97).toString() +
        validationString.slice(part.length);
    }
    return parseInt(validationString, 10) % 97 === 1;
  }

  return BaseType.extend("validationservice.library.customTypes.IBANType", {
    // eslint-disable-next-line object-shorthand
    constructor: function ({ constraints, required, resBundle }, ...args) {
      BaseType.apply(this, { required, resBundle }, args);

      this.type = new sap.ui.model.type.String();
      this.type.setConstraints(constraints);
      this.resBundle = resBundle;
    },

    formatValue(IBAN) {
      return this.type.formatValue(IBAN, "string");
    },

    parseValue(IBAN) {
      return this.type.parseValue(IBAN, "string");
    },

    validateValue(IBAN) {
      this.type.validateValue(IBAN, "string");

      const isIBANEntered = IBAN !== "" && IBAN !== undefined && IBAN !== null;

      if (isIBANEntered) {
        const IBANErrorText = this.resBundle.getText("IBAN.invalid");

        const country = countrySpecs[IBAN.slice(0, 2)];
        const enteredCountryIsValid = country !== undefined;

        if (enteredCountryIsValid) {
          const IBANHasCorrectLength = country.chars === IBAN.length;
          const hasCorrectIBAN = checkFormatIBAN(
            IBAN.slice(4),
            countrySpecs.IBANRegex
          );
          const hasCorrectCheckDigit = testCheckDigit(IBAN);

          if (
            !IBANHasCorrectLength ||
            !hasCorrectIBAN ||
            !hasCorrectCheckDigit
          ) {
            throw new ValidateException(IBANErrorText);
          }
        } else {
          throw new ValidateException(IBANErrorText);
        }
      }
    },
  });
});
