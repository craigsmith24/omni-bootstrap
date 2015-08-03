define('omni-consumer-client', [
	'omni',
	'omni-salepoint-model',
	'omni-account-model',
	'omni-business-hours-model',
	'omni-coupon-model',
	'omni-sale-order-model',
	'jquery'
], function(
	omni,
	SalePoint,
	Account,
	BusinessHours,
	Coupon,
	SaleOrder,
    $
) {

	"use strict";

	var SUPPORTED_ZIP_CODES = [94158, 94124, 94115, 94117, 94114, 94110, 94103, 94102, 94124, 94109, 94108, 94111, 94133, 94104, 94105, 94107, 94124, 94122];

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

	function ConsumerClient(host, key) {
		this.host = host;
		this.key = key;
		this.errorHandlers = {};
	}

	ConsumerClient.statusCodes = {
		OK: 200,
		NOT_FOUND: 404,
		AUTH_REQUIRED: 401,
		ALREADY_LOGGED_IN: 1016
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
			return this.host + '/api/v1/' + path;
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
						messages: [{type: "error", text: "Unable to communicate with the API"}],
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
			return this.exec('saleorders/check-ins', null, { method: 'GET' }).then(function (resp) {
				return resp.bodyContent(SaleOrder);
			});
		},

		lookupCoupon: function(code) {
			var job = $.Deferred();
			if (Coupon.isValidCode(code))
				job.resolve(new Coupon({ code: $.trim(code).toLowerCase() }));
			else job.reject(new Response({
				statusCode: ConsumerClient.statusCodes.NOT_FOUND,
				statusMessage: 'Not Found',
				body: {
					messages: [{type: "error", text: "Invalid coupon code"}],
					content: false
				}
			}));
			return job.promise();
		},

		updateProfile: function(details) {
			return this.exec('profile', details).then(function (resp) {
				return resp.bodyContent(Account);
			});
		},

		loginWithFacebookToken: function (token, extra) {
			var params = $.extend(extra || {}, { token: token });
			return this.exec('auth/login-facebook', params).then(function (resp) {
				return resp.bodyContent(Account);
			});
		},

		login: function (details) {
			return this.exec('auth/login', details).then(function (resp) {
				return resp.bodyContent(Account);
			});
		},

		logout: function () {
			return this.exec('auth/logout', null, { method: 'GET' });
		},

		signup: function (details) {
			return this.exec('auth/signup', details).then(function (resp) {
				return resp.bodyContent(Account);
			});
		},

		createLead: function (details) {
			var params = $.extend({
				building_name: this.constants.CUSTOM_BUILDING_NAME
			}, details || {}, {
				key: this.key
			});
			return this.exec('auth/lead', params).then(function (resp) {
				return resp.bodyContent(Account);
			});
		},

		schedulerBusinessHours: function () {
			return this.exec('scheduler/business-hours', null, { method: 'GET' }).then(function (resp) {
				return resp.bodyContent(BusinessHours);
			});
		},

		requestPickup: function (date) {
			return this.exec('scheduler/pickup-date', {
				scheduled_date: date.toISOString()
			});
		},

		updatePaymentCredentials: function(details){
			return this.exec('payments/credentials', details);
		},

		salePointsByAddress: function (address, distance) {
			return this.exec('salepoints/by-address', {
				address: address,
				distance: distance
			}).then(function (resp) {
				return resp.bodyContent(SalePoint);
			});
		},

		zipCodeSupported: function (zipCode) {
			var zip = parseInt(zipCode, 10);
			var supported = SUPPORTED_ZIP_CODES.indexOf(zip) >= 0;
			return $.Deferred().resolve(supported);
		}

	};

	omni.clients.ConsumerClient = ConsumerClient;
	return ConsumerClient;

});