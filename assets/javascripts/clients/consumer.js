"use strict";

import omni from '../omni';
import SalePoint from '../models/salepoint';
import Account from '../models/account';
import Coupon from '../models/coupon';
import SaleOrder from '../models/sale_order';
import TimeSlotGroup from '../models/timeslot-group';
import $ from 'jquery';
    

const API_VERSION = 'v2';

function formatLocalDate(now) {
  const tzo = -now.getTimezoneOffset();
  const dif = tzo >= 0 ? '+' : '-';
  const pad = function(num) {
    const norm = Math.abs(Math.floor(num));
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

class Response {
  constructor(data){
    this.data = $.isPlainObject(data) ? data : { 
      statusCode: 0, 
      statusMessage: data, 
      body: {}
    }
  }

  isError() {
    return this.statusCode() !== ConsumerClient.statusCodes.OK;
  }

  statusCode() {
    return this.data.statusCode;
  }

  errorMessage() {
    const status = this.data.statusMessage;
    const messages = this.data.body.messages;
    return messages && messages.length ? messages[0].text : status;
  }

  bodyContent(Model) {
    const content = this.data.body.content;
    if (Model === undefined) {
      return content;
    }
    const map = function (data) {
      return new Model(data);
    };
    if ($.isArray(content)) {
      return $.map(content, map);
    }else {
      return map(content);
    }
  }
}

function makeModel(klass) {
  return (resp) => {
    return resp.bodyContent(klass);
  };
}

const makeAccount = makeModel(Account);
const makeTimeSlotGroups = makeModel(TimeSlotGroup);


export default class ConsumerClient {
  constructor(host,key){
    this.host = host;
    this.key = key;
    this.errorHandlers = {};
    this.statusCodes = {
      OK: 200,
      NOT_FOUND: 404,
      AUTH_REQUIRED: 401,
      ALREADY_LOGGED_IN: 1016,
      UNSUPPORTED_ZIPCODE: 1600
    };
    this.constants = {
      CUSTOM_BUILDING_NAME: 'My Residence'
    };
  }

  onError(code, handler) {
    if (!this.errorHandlers.hasOwnProperty(code)){
      this.errorHandlers[code] = $.Callbacks();
    }  
    this.errorHandlers[code].add(handler);
  }

  absUrl(path) {
    return this.host + ['/api', API_VERSION, path].join('/');
  }

  exec(path, data, options) {
    const errorHandlers = this.errorHandlers;
    return $.ajax($.extend({}, {
      method: 'POST',
      url: this.absUrl(path),
      context: this,
      data: data,
      xhrFields: {
        withCredentials: true
      }
    }, options || {})).then((data) => {
      const response = new Response(data);
      return response.isError() ? $.Deferred().reject(response) : response;
    }, (xhr, error, message) => {
      return new Response({
        statusCode: xhr.status || 0,
        statusMessage: message || error,
        body: {
          messages: [{type: "error", text: "The service is not responding."}],
          content: false
        }
      });
    }).fail((resp) => {
      const code = resp.statusCode().toString();
      if (code in errorHandlers) {
        errorHandlers[code].fire(resp);
      }
    });
  }

  depositSaleOrders() {
    return this.exec('saleorders/check-ins', null, { method: 'GET' }).then(makeModel(SaleOrder));
  }

  lookupCoupon(code) {
    code = $.trim(code).toUpperCase();
    return this.exec('coupons/lookup', { code: code }, { method: 'GET' }).then(makeModel(Coupon));      
  }

  updateProfile(details) {
    return this.exec('profile', details).then(makeAccount);
  }

  loginWithFacebookToken(token, extra) {
    const params = $.extend({ lead_source: 'Web' }, extra || {}, { token: token });
    return this.exec('auth/login-facebook', params).then(makeAccount);
  }

  login(details) {
    details = $.extend({ lead_source: 'Web' }, details || {});
    return this.exec('auth/login', details).then(makeAccount);
  }

  logout() {
    return this.exec('auth/logout', null, { method: 'GET' });
  }

  signup(details) {
    details = $.extend({ lead_source: 'Web' }, details || {});
    return this.exec('auth/signup', details).then(makeAccount);
  }

  createLead(details) {
    const params = $.extend({
      lead_source: 'Web',
      building_name: this.constants.CUSTOM_BUILDING_NAME
    }, details || {}, {
      api_key: this.key
    });
    return this.exec('auth/lead', params).then(makeAccount);
  }

  requestPickup(date) {
    return this.exec('scheduler/pickup-date', {
      scheduled_date: formatLocalDate(date)
    });
  }

  updatePaymentCredentials(details){
    return this.exec('payments/credentials', details).then((r) => {
      return r.bodyContent();
    });
  }

  salePointsByAddress(address, distance) {
    return this.exec('salepoints/by-address', {
      address: address,
      distance: distance
    }).then(makeModel(SalePoint));
  }

  checkZip(zip) {
    return this.exec('region/check-zip', 
      { zip: zip, api_key: this.key }
    ).then((resp) => {
      return resp.bodyContent();
    }, (resp) => {
      if (resp.statusCode() === ConsumerClient.statusCodes.UNSUPPORTED_ZIPCODE) {
        return $.Deferred().resolve(false);
      }else{ 
        return resp;
      }
    });
  }

  checkInTimeSlotGroups(zip) {
    return this.exec('scheduler/check-in', { zip: zip }, { method: 'GET' }).then(makeTimeSlotGroups);
  }
}

omni.clients.ConsumerClient = ConsumerClient;