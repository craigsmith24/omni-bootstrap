define('omni-address-model', [
	'omni'
], function(
	omni
) {

	"use strict";

	var DEFAULT_STREET = /1150 illinois st/gi;

	function Address(data) {
		this.data = data;
	}

	Address.prototype = {
		title: function() { return this.data.title; },
		apt: function() { return this.data.apt; },
		street: function() { 
			var street = this.data.street; 
			if (DEFAULT_STREET.test(street)) return '';
			else return street;
		},
		city: function() { return this.data.city; },
		state: function() { return this.data.state; },
		formatted: function() { return this.data.formated_address; },
		zip: function() { return this.data.zip; }
	};

	omni.models.Address = Address;
	return Address;

});