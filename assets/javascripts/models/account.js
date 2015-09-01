define('omni-account-model', [
	'omni',
	'omni-address-model',
	'jquery'
], function(
	omni,
	Address,
	$
) {

	"use strict";

	function Account(data) {
		this.data = data;
	}

	Account.prototype = {
		name: function(){ return this.data.name; },
		firstName: function(){ return this.data.first_name; },
		lastName: function(){ return this.data.last_name; },
		email: function(){ return this.data.email; },
		id: function(){ return this.data.id || 'anonymous'; },
		discountCode: function(val) {
			if (val === undefined) return this.data.discount_code;
			else this.data.discount_code = val;
			return this;
		},
		pricingPlan: function(val) {
			if (val === undefined) return this.data.billing_plan || this.data.pricing_plan;
			else this.data.billing_plan = this.data.pricing_plan = val;
			return this;
		},
		hasPricingPlan: function() {
			return !!this.pricingPlan();
		},
		hasPaymentCredentials: function(val) {
			if (val === undefined) return !!this.data.payment_credentials_filled;
			else this.data.payment_credentials_filled = !!val;
			return this;
		},
		isBillable: function() {
			return this.hasPaymentCredentials() && this.hasPricingPlan();
		},
		canCheckin: function() {
			return this.hasAddress() && this.hasPhone();
		},
		phone: function(val) {
			if (val === undefined) return this.data.phone;
			else this.data.phone = val;
			return this;
		},
		hasPhone: function() {
			return !!this.phone();
		},
		hasAddress: function(){
			return !!this.address();
		},
		address: function(value){
			if (value === undefined)
				return this.data.address ? new Address(this.data.address) : null;
			else this.data.address = value;
			return this;
		}
	};

	omni.models.Account = Account;
	return Account;

});