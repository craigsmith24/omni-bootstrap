define('omni-service-hours-model', [
	'omni'
], function(
	omni
) {

	"use strict";

	function ServiceHours(data) {
		this.data = data;
	}

	ServiceHours.prototype = {
		
		minDate: function() {

			// get the current date plus lead time
			var date = new Date();
			switch (date.getDay()) {
				case 6: case 0:
					date.setTime(date.getTime()+this.data.weekend.lead*1000); break;
				default:
					date.setTime(date.getTime()+this.data.weekday.lead*1000);
			}

			// normalize to interval
			var minterval = Math.floor(this.data.weekday.interval/60);
			var mins = Math.floor(date.getMinutes()*60/this.data.weekday.interval) * minterval;
			date.setHours(date.getHours(), mins+minterval, 0, 0);

			// get the close time for the min date
			var cutoff;
			switch (date.getDay()) {
				case 6: case 0:
					cutoff = this.data.weekend.end; break;
				default:
					cutoff = this.data.weekday.end;
			}		

			// now determine if the min date is after hours; 
			var end  = new Date(date.getTime());
			end.setHours(Math.floor(cutoff/3600), Math.floor(cutoff%3600/60), 0, 0);
			if (end > date) return date;

			// if so, push the date to tomorrow open date
			date.setDate(date.getDate()+1);
			switch (date.getDay()) {
				case 6: case 0:
					cutoff = this.data.weekend.start; break;
				default:
					cutoff = this.data.weekday.start;
			}

			// and open time
			date.setHours(Math.floor(cutoff/3600), Math.floor(cutoff%3600/60), 0, 0);
			return date;

		},

		duration: function(date) {
			switch (date.getDay()) {
				case 6: case 0:
					return this.data.weekend.interval * 1000;
				default:
					return this.data.weekend.interval * 1000;
			}
		},

		minuteInterval: function(date) {
			switch (date.getDay()) {
				case 6: case 0:
					return Math.floor(this.data.weekend.interval / 60);
				default:
					return Math.floor(this.data.weekday.interval / 60);
			}
		},

		operatingRange: function(date) {
			var from, to, min = this.minDate();
			switch (date.getDay()) {
				case 6: case 0:
					from = this.data.weekday.start;
					to = this.data.weekday.end;
					break;
				default:
					from = this.data.weekend.start;
					to = this.data.weekend.end;
			}
			var selectedDate = new Date(date.getTime()).setHours(0,0,0,0);
			var minDate = new Date(min.getTime()).setHours(0,0,0,0);
			var interval = this.data.weekday.interval;
			if (minDate === selectedDate) {
				var minSeconds = Math.floor((min.getTime() - minDate)/1000);
				if (from < minSeconds) from = minSeconds;
			}
			return {
				min: [Math.floor(from/3600),(from%3600)/60],
				max: [Math.floor(to/3600),(to%3600)/60],
				interval: this.minuteInterval(date)
			};
		}

	};

	omni.models.ServiceHours = ServiceHours;
	return ServiceHours;

});