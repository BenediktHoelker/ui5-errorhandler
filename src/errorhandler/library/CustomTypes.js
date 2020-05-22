sap.ui.define(
  [
    "./customTypes/Boolean",
    "./customTypes/Currency",
    "./customTypes/Date",
    "./customTypes/Decimal",
    "./customTypes/Email",
    "./customTypes/IBAN",
    "./customTypes/Integer",
    "./customTypes/NWR",
    "./customTypes/Phone",
    "./customTypes/Rating",
    "./customTypes/String",
  ],
  function (
    BooleanType,
    CurrencyType,
    DateType,
    DecimalType,
    EmailType,
    IBANType,
    IntegerType,
    NWRType,
    PhoneNumberType,
    RatingType,
    StringType
  ) {
    return {
      init(options) {
        const today = new Date();

        // die folgenden Datentypen können für die Eingabe eines Datums verwendet werden
        // wichtig: beim Datepicker immer valueFormat="medium" (Erklärung in der Datei customTypes/DateType.js)

        // => Für MIN-Datum immer einen Tag abziehen !!!!!!!!!!!!
        // Datum von gestern als Minimal-Wert um das Datum noch auf heute setzen zu können
        const yesterday = new Date(
          new Date(today.getTime()).setDate(today.getDate() - 1)
        );

        const timeStamp18YearsAgo = new Date(today.getTime()).setFullYear(
          today.getFullYear() - 18
        );
        const date18YearsAgo = new Date(timeStamp18YearsAgo);

        return {
          booleanRequired: new BooleanType({
            ...options,
            required: true,
          }),
          currencyRequiredNoMeasure: new CurrencyType({
            formatOptions: {
              showMeasure: false,
            },
            required: true,
            ...options,
          }),
          requiredMediumDate: new DateType({
            required: true,
            ...options,
          }),
          mediumDate: new DateType(options),
          requiredMediumDateMaxToday: new DateType({
            constraints: {
              maximum: today,
            },
            required: true,
            ...options,
          }),
          requiredMediumDateMinToday: new DateType({
            constraints: {
              minimum: yesterday,
            },
            required: true,
            ...options,
          }),
          mediumDateMinToday: new DateType({
            constraints: {
              minimum: yesterday,
            },
            ...options,
          }),
          requiredMediumDateMax18YAgo: new DateType({
            constraints: {
              maximum: date18YearsAgo,
            },
            required: true,
            ...options,
          }),
          mediumDateMax18YAgo: new DateType({
            constraints: {
              maximum: date18YearsAgo,
            },
            ...options,
          }),
          requiredP13S3Not0: new DecimalType({
            constraints: {
              nullable: false,
              precision: 13,
              scale: 3,
            },
            invalidValues: [0],
            ...options,
          }),
          requiredP13S3Not0Positiv: new DecimalType({
            constraints: {
              nullable: false,
              precision: 13,
              minimum: 0,
              scale: 3,
            },
            invalidValues: [0],
            ...options,
          }),
          email: new EmailType({ ...options }),
          emailRequired: new EmailType({
            constraints: {
              minLength: 1,
            },
            ...options,
          }),
          IBANRequired: new IBANType({
            constraints: {
              minLength: 1,
            },
            ...options,
          }),
          requiredIntegerNot0: new IntegerType({
            required: true,
            invalidValues: [0],
            ...options,
          }),
          positiveInteger: new IntegerType({
            required: false,
            range: {
              minimum: 0,
            },
            ...options,
          }),
          NWRRequired: new NWRType({
            constraints: {
              minLength: 1,
              maxLength: 21,
            },
            ...options,
          }),
          NWR: new NWRType({
            constraints: {
              maxLength: 21,
            },
            ...options,
          }),
          phoneRequired: new PhoneNumberType({
            constraints: {
              minLength: 1,
            },
            ...options,
          }),
          ratingRequired: new RatingType({
            constraints: {
              minimum: 1,
              maximum: 5,
            },
            required: true,
            ...options,
          }),
          stringRequired: new StringType({
            constraints: {
              minLength: 1,
            },
            ...options,
          }),
        };
      },
    };
  }
);
