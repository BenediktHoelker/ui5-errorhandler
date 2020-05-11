sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/test/OpaPlugin",
	"sap/ui/model/resource/ResourceModel"
], function(Object, OpaPlugin, ResourceModel) {
	"use strict";

	return Object.extend("errorhandler.library.handling.BaseHandling", {

		getResBundle: function() {
			if (!this._oResBundle) {
				const oResourceModel = new ResourceModel({
					bundleName: "errorhandler.library.i18n.i18n"
				});
				this._oResBundle = oResourceModel.getResourceBundle();
			}
			return this._oResBundle;
		},

		getMessageModel: function() {
			return this.getMessageManager().getMessageModel();
		},

		getMessageManager: function() {
			return sap.ui.getCore().getMessageManager();
		},

		getAllControls: function() {
			const oOpaPlugin = new OpaPlugin();
			return oOpaPlugin.getAllControls();
		},

		checkIfControlIsType: function(oControl, sType) {
			return oControl && typeof oControl.getMetadata === "function" && typeof oControl.getMetadata().getName === "function" && oControl.getMetadata()
				.getName() === sType;
		},

		getBindingOfControl: function(oInput) {
			return oInput.getBinding("value") || oInput.getBinding("selected") || oInput.getBinding("selectedKey") ||
				oInput.getBinding("dateValue");
		},

		getBindingName: function(oInput) {
			if (oInput.getBinding("value")) {
				return "value";
			}

			if (oInput.getBinding("selected")) {
				return "selected";
			}

			if (oInput.getBinding("selectedKey")) {
				return "selectedKey";
			}

			if (oInput.getBinding("dateValue")) {
				return "dateValue";
			}

			return "";
		},

		getMessagesOfControl: function(oControl) {
			const oBinding = this.getBindingOfControl(oControl);
			if (!oBinding) {
				return this._getMessagesOfSmartField(oControl);
			}
			return oBinding.getDataState().getMessages().concat(this._getMessagesOfSmartField(oControl));
		},

		_getMessagesOfSmartField: function(oInput) {
			const bIsSmartfield = this.checkIfControlIsType(oInput, "sap.ui.comp.smartfield.SmartField");
			if (bIsSmartfield && typeof oInput.getInnerControls === "function" && oInput.getInnerControls().length > 0) {
				const oInnerControl = oInput.getInnerControls()[0];
				const oBinding = this.getBindingOfControl(oInnerControl);
				if (oBinding) {
					return oBinding.getDataState().getMessages();
				}

				// falls das SmartField als nicht editabled oder nicht enabled ist, ist das innerControl ein sap.m.Text Control
				// die Messages dieses Controls können nicht über den DataState ausgelesen werden
				if (!oInput.getEnabled() || !oInput.getEditable()) {
					return this.getMessageModel().getData()
						.filter(message => message.getTarget() === oInput.getId() + "-input/value");
				}
			}
			return [];
		}

	});
});