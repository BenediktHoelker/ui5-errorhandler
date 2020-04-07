sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/resource/ResourceModel"
], function(Object, ResourceModel) {
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
		}

	});
});