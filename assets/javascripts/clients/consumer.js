//todo: update this file for ES6

define('omni-consumer-client', [
	'omni',
	'omni-salepoint-model',
	'omni-account-model',
	'omni-coupon-model',
	'omni-sale-order-model',
	'omni-timeslot-group-model',
	'jquery'
], function(
	omni,
	SalePoint,
	Account,
	Coupon,
	SaleOrder,
	TimeSlotGroup,
    $
) {

	"use strict";

	var API_VERSION = 'v2';

	function formatLocalDate(now) {
	    var tzo = -now.getTimezoneOffset(),
	        dif = tzo >= 0 ? '+' : '-',
	        pad = function(num) {
	            var norm = Math.abs(Math.floor(num));
	            return (norm < 10 ? '0' : '') + norm;
	        };
	    return now.getFullYear() 
	        + '-' + pad(now.getMonth()+1)
	        + '-' + pad(now.getDate())
	        + 'T' + pad(now.getHours())
	        + ':' + pad(now.getMinutes()) 
	        + ':' + pad(now.getSeconds()) 
	        + dif + pad(tzo / 60) 
	        + ':' + pad(tzo % 60);
	}

	function Response(data) {
		this.data = $.isPlainObject(data) ? data : { 
			statusCode: 0, 
			statusMessage: data, 
			body: {}
		};
	}

	Response.prototype = {

		isError: function () {
			return this.statusCode() !== ConsumerClient.statusCodes.OK;
		},

		statusCode: function () {
			return this.data.statusCode;
		},

		errorMessage: function () {
			var status = this.data.statusMessage;
			var messages = this.data.body.messages;
			return messages && messages.length ? messages[0].text : status;
		},

		bodyContent: function (Model) {
			var content = this.data.body.content;
			if (Model === undefined) return content;
			var map = function (data) {
				return new Model(data);
			};
			if ($.isArray(content)) return $.map(content, map);
			else return map(content);
		}

	};

	function makeModel(klass) {
		return function(resp) {
			return resp.bodyContent(klass);
		};
	}

	var makeAccount = makeModel(Account);
	var makeTimeSlotGroups = makeModel(TimeSlotGroup);

	function ConsumerClient(host, key) {
		this.host = host;
		this.key = key;
		this.errorHandlers = {};
	}

	ConsumerClient.statusCodes = {
		OK: 200,
		NOT_FOUND: 404,
		AUTH_REQUIRED: 401,
		ALREADY_LOGGED_IN: 1016,
		UNSUPPORTED_ZIPCODE: 1600,
	};

	ConsumerClient.prototype = {

		statusCodes: ConsumerClient.statusCodes,

		constants: {
			CUSTOM_BUILDING_NAME: 'My Residence'
		},

		onError: function(code, handler) {
			if (!this.errorHandlers.hasOwnProperty(code))
				this.errorHandlers[code] = $.Callbacks();
			this.errorHandlers[code].add(handler);
		},

		absUrl: function (path) {
			return this.host + ['/api', API_VERSION, path].join('/');
		},

		exec: function (path, data, options) {
			var errorHandlers = this.errorHandlers;
			return $.ajax($.extend({}, {
				method: 'POST',
				url: this.absUrl(path),
				context: this,
				data: data,
				xhrFields: {
					withCredentials: true
				}
			}, options || {})).then(function (data) {
				var response = new Response(data);
				return response.isError() ? $.Deferred().reject(response) : response;
			}, function (xhr, error, message) {
				return new Response({
					statusCode: xhr.status || 0,
					statusMessage: message || error,
					body: {
						messages: [{type: "error", text: "The service is not responding."}],
						content: false
					}
				});
			}).fail(function(resp){
				var code = resp.statusCode().toString();
				if (code in errorHandlers)
					errorHandlers[code].fire(resp);
			});
		},

		depositSaleOrders: function() {
			return this.exec('saleorders/check-ins', null, { method: 'GET' }).then(makeModel(SaleOrder));
		},

		lookupCoupon: function(code) {
			code = $.trim(code).toUpperCase();
			return this.exec('coupons/lookup', { code: code }, { method: 'GET' }).then(makeModel(Coupon));			
		},

		updateProfile: function(details) {
			return this.exec('profile', details).then(makeAccount);
		},

		loginWithFacebookToken: function (token, extra) {
			var params = $.extend({ lead_source: 'Web' }, extra || {}, { token: token });
			return this.exec('auth/login-facebook', params).then(makeAccount);
		},

		login: function (details) {
			details = $.extend({ lead_source: 'Web' }, details || {});
			return this.exec('auth/login', details).then(makeAccount);
		},

		logout: function () {
			return this.exec('auth/logout', null, { method: 'GET' });
		},

		signup: function (details) {
			details = $.extend({ lead_source: 'Web' }, details || {});
			return this.exec('auth/signup', details).then(makeAccount);
		},

		createLead: function (details) {
			var params = $.extend({
				lead_source: 'Web',
				building_name: this.constants.CUSTOM_BUILDING_NAME
			}, details || {}, {
				api_key: this.key
			});
			return this.exec('auth/lead', params).then(makeAccount);
		},

		requestPickup: function (date) {
			return this.exec('scheduler/pickup-date', {
				scheduled_date: formatLocalDate(date)
			});
		},

		updatePaymentCredentials: function(details){
			return this.exec('payments/credentials', details).then(function(r){
				return r.bodyContent();
			});
		},

		salePointsByAddress: function (address, distance) {
			return this.exec('salepoints/by-address', {
				address: address,
				distance: distance
			}).then(makeModel(SalePoint));
		},

		checkZip: function (zip) {
			return this.exec('region/check-zip', 
				{ zip: zip, api_key: this.key }
			).then(function(resp){
				return resp.bodyContent();
			}, function(resp) {
				if (resp.statusCode() === ConsumerClient.statusCodes.UNSUPPORTED_ZIPCODE)
					return $.Deferred().resolve(false);
				else 
					return resp;
			});
		},

		checkInTimeSlotGroups: function (zip) {
			return this.exec('scheduler/check-in', { zip: zip }, { method: 'GET' }).then(makeTimeSlotGroups);
		}

	};

	omni.clients.ConsumerClient = ConsumerClient;
	return ConsumerClient;

});