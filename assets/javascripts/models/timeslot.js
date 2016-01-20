define('omni-timeslot-model', [
	'omni'
], function(
	omni
) {

	"use strict";

	TimeSlot.DEFAULT_WINDOW = 1000 * 60 * 15; // fifteen minutes

	function TimeSlot(data) {
		if (!data.duration && !data.end) data.duration = TimeSlot.DEFAULT_WINDOW;
		if (!data.end) data.end = new Date(data.start).getTime() + data.duration;
		data.duration = data.end - data.start;
		this.data = data;
	}

	TimeSlot.prototype = {
		price: function() { return this.data.price; }, 
		duration: function() { return this.data.duration; },
		start: function() { return new Date(this.data.start); },
		end: function() { return new Date(this.data.end); }
	};

	omni.models.TimeSlot = TimeSlot;
	return TimeSlot;

});