sap.ui.define(["./Base", "sap/ui/model/ValidateException"], function (
  BaseType,
  ValidateException
) {
  const aNWRIdDigit = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
    4: "E",
    5: "F",
    6: "G",
    7: "H",
    8: "I",
    9: "J",
    10: "K",
    11: "L",
    12: "M",
    13: "N",
    14: "O",
    15: "P",
    16: "Q",
    17: "R",
    18: "S",
    19: "T",
    20: "U",
    21: "V",
    22: "W",
    23: "X",
    24: "Y",
    25: "Z",
  };

  return BaseType.extend("validationservice.library.customTypes.NWRType", {
    // required wird über constraints abgebildet
    // eslint-disable-next-line object-shorthand
    constructor: function ({ constraints, required, resBundle }, ...args) {
      BaseType.apply(this, { required, resBundle }, args);

      this.type = new sap.ui.model.type.String();
      this.type.setConstraints(constraints);
    },

    formatValue(sNWRId) {
      return this.type.formatValue(sNWRId, "string");
    },

    parseValue(sNWRId) {
      let sUpperCaseNWR = sNWRId;
      if (sNWRId !== undefined) {
        // die NWR-ID soll immer als uppercase im Model gespeichert sein, da sie auch an das Backend im UpperCase übergeben wird
        // und dem Benutzer als Uppercase angezeigt werden soll
        sUpperCaseNWR = sNWRId.toUpperCase();
      }
      return this.type.parseValue(sUpperCaseNWR, "string");
    },

    validateValue(sNWRId) {
      return true;
      // this.type.validateValue(sNWRId, "string");

      // const bIsNWRIdEntered =
      //   sNWRId !== "" && sNWRId !== undefined && sNWRId !== null;

      // if (bIsNWRIdEntered) {
      //   // Bitte geben Sie eine gültige NWR-ID an
      //   const sNWRErrorText = this.resBundle.getText("NWR.invalid");

      //   const bIsValidLength = sNWRId.length === 21;
      //   if (bIsValidLength) {
      //     const sCheckSum = sNWRId.charAt(sNWRId.length - 1).toUpperCase();

      //     let sNWRTotalNumber = sNWRId.substring(1, sNWRId.length - 2);
      //     while (sNWRTotalNumber.includes("-")) {
      //       sNWRTotalNumber = sNWRTotalNumber.replace("-", "");
      //     }

      //     let iCheckSum = 0;
      //     for (let index = 0; index < sNWRTotalNumber.length; index += 1) {
      //       if (index % 2 === 0) {
      //         iCheckSum += parseInt(sNWRTotalNumber.charAt(index), 10);
      //       } else {
      //         iCheckSum += parseInt(sNWRTotalNumber.charAt(index), 10) * 3;
      //       }
      //     }

      //     iCheckSum %= 26;

      //     const bIsValid = aNWRIdDigit[iCheckSum] === sCheckSum;
      //     if (!bIsValid) {
      //       throw new ValidateException(sNWRErrorText);
      //     }
      //   } else {
      //     throw new ValidateException(sNWRErrorText);
      //   }
      // }
    },
  });
});
