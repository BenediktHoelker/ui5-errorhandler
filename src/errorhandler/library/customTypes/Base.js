sap.ui.define(
  ["sap/ui/model/resource/ResourceModel", "sap/ui/model/SimpleType"],
  function (ResourceModel, SimpleType) {
    return SimpleType.extend("validationservice.library.customTypes.Base", {
      // eslint-disable-next-line object-shorthand
      constructor: function ({ required } = {}, ...args) {
        SimpleType.apply(this, args);

        this.required = required;
        this.resBundle = this.getResBundle();
      },

      getResBundle() {
        if (!this.resBundle) {
          this.resBundle = new ResourceModel({
            bundleName: "validationservice.library.i18n.i18n",
          }).getResourceBundle();
        }
        return this.resBundle;
      },
    });
  }
);
