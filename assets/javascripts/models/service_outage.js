define('omni-service-outage-model', [
	'omni'
], function(
	omni
) {

	"use strict";

	function ServiceOutage(data) {
		this.data = data;
	}

	ServiceOutage.prototype = {
		
		occursDuring: function(date) {
			var secs = date.getTime() / 1000;
			return this.data.start_timestamp <= secs &&  this.data.end_timestamp >= secs;
		}

	};

	omni.models.ServiceOutage = ServiceOutage;
	return ServiceOutage;

});