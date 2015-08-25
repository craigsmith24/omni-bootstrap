define('omni-region-schedule-model', [
	'omni',
	'omni-service-hours-model',
	'omni-service-outage-model',
], function(
	omni, ServiceHours, ServiceOutage
) {

	"use strict";

	function RegionSchedule(data) {
		this.data = data;
	}

	RegionSchedule.prototype = {
		
		serviceHours: function() {
			return new ServiceHours(this.data.hours);
		},
		
		serviceOutages: function() {
			return $.map(this.data.outages || [], function(data){
				return new ServiceOutage(data);
			});
		}

	};

	omni.models.RegionSchedule = RegionSchedule;
	return RegionSchedule;

});