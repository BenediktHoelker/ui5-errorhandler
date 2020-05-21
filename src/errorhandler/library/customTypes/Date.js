sap.ui.define(["./Base", "sap/ui/model/ValidateException"], function (
  BaseType,
  ValidateException
) {
  /*
	  WICHTIG: !!!!!!!!!!!!!!!
		Beim DatePicker immer angeben: valueFormat="medium" !
		So wird das Datum mit dem gesamten Jahr übergeben (DDMMYYYY), und nicht wie defaultmäßig nur letzten beiden Ziffern des Jahres (DDMMYY).
		Ansonsten kann nicht erkannt werden welches Jahrhundert eingetragen wurde.
		Für die Eingabe "01.01.1904" kann sonst beispielsweise die Fehlermeldung: "Geben Sie ein Datum vor dem 04.11.2001 ein" erscheinen, da "1904" wie "2004" behandelt wird.
	 */

  return BaseType.extend("validationservice.library.customTypes.DateType", {
    // eslint-disable-next-line object-shorthand
    constructor: function (
      {
        formatOptions = { style: "medium", strictParsing: true },
        constraints,
        required,
        resBundle,
      } = {},
      ...args
    ) {
      BaseType.apply(this, { required, resBundle }, args);

      const formatOptionsUTC = { UTC: true, ...formatOptions };

      this.type = new sap.ui.model.type.Date();
      this.type.setFormatOptions(formatOptionsUTC);
      this.type.setConstraints(constraints);
    },

    formatValue(date) {
      return this.type.formatValue(date, "any");
    },

    parseValue(date) {
      return this.type.parseValue(date, "string");
    },

    validateValue(date) {
      if (this.required && date === null) {
        // "Geben Sie ein Datum ein"
        throw new ValidateException(
          sap.ui.getCore().getLibraryResourceBundle().getText("Date.Invalid")
        );
      } else {
        this.type.validateValue(date);
      }
    },
  });
});
