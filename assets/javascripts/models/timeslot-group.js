define('omni-timeslot-group-model', [
	'omni',
	'omni-timeslot-model'
], function(
	omni,
	TimeSlot
) {

	"use strict";

	function TimeSlotGroup(data) {
		var slots = [];
		var instance = this;
		$.each(data, function(_, data){
			var slot;
			if (data.datetime) {
				var start = data.datetime * 1000;
				var price = parseFloat(data.amount);
				slot = new TimeSlot({ start: start, price: price });
			} else if (data.start) {
				slot = new TimeSlot(data);
			} else if (data instanceof TimeSlot) {
				slot = data;
			}
			if (slot) {
				slots.push(slot);				
			} else {
				throw new Error('Unacceptable TimeSlot data: ' + data);
			}
		});
		this.data = { timeSlots: slots }; 
	}

	TimeSlotGroup.prototype = {
		timeSlots: function() {
			return this.data.timeSlots ? this.data.timeSlots : [];
		},
		timeSlot: function(i) {
			var slots = this.timeSlots();
			if (slots.length <= 0) {
				return null;
			} else if (slots.length > i) {
				if (i < 0) return this.timeSlot(slots.length + i);
				else return slots[i];
			} else {
				return null;
			}
		},
		timeSlotStartDate: function(i) {
			var slot = this.timeSlot(i);
			return slot ? slot.start() : null;
		},
		timeSlotStartDates: function() {
			return $.map(this.timeSlots(), function(slot){ 
				return slot.start();
			});
		},
		timeSlotDuration: function() {
			var slot = this.timeSlot(0);
			return slot ? slot.duration() : null;
		},
		day: function() {
			var start = this.timeSlotStartDate(0);
			return start ? new Date(start.setHours(0, 0, 0, 0)) : null;
		}
	};

	omni.models.TimeSlotGroup = TimeSlotGroup;
	return TimeSlotGroup;

});