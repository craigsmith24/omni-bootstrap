define('omni-coupon-model', [
	'omni'
], function(
	omni
) {

	"use strict";

	function Coupon(data) {
		this.data = data;
	}

	Coupon.prototype = {
		code: function() { return $.trim(this.data.code).toUpperCase(); },
		title: function() { return this.data.title; },
		subtitle: function() { return this.data.subtitle; },
		caption: function() { return this.data.caption; },
		image: function() { return this.data.image; }
	};

	omni.models.Coupon = Coupon;
	return Coupon;

});