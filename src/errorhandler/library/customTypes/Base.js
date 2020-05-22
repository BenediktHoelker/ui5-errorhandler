sap.ui.define(["sap/ui/model/SimpleType"], function (SimpleType) {
  return SimpleType.extend("validationservice.library.customTypes.Base", {
    // eslint-disable-next-line object-shorthand
    constructor: function (options) {
      SimpleType.apply(this);

      Object.entries(options).forEach(([key, value]) => {
        this[key] = value;
      });
    },
  });
});
