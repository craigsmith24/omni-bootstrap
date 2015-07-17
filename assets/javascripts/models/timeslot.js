define('omni-timeslot-model', [
	'omni'
], function(
	omni
) {

	"use strict";

	TimeSlot.DEFAULT_WINDOW = 60 * 60 * 15; // fifteen minutes

	function TimeSlot(data) {
		if (!data.end)
			data.end = new Date(data.start).getTime() + TimeSlot.DEFAULT_WINDOW;
		this.data = data;
	}

	TimeSlot.prototype = {
		start: function() { return new Date(this.data.start); },
		end: function() { return new Date(this.data.end); }
	};

	omni.models.TimeSlot = TimeSlot;
	return TimeSlot;

});