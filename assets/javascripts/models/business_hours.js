define('omni-business-hours-model', [
	'omni'
], function(
	omni
) {

	"use strict";

	function BusinessHours(data) {
		this.data = data;
	}

	BusinessHours.prototype = {
		
	};

	omni.models.BusinessHours = BusinessHours;
	return BusinessHours;

});