"use strict";

import omni from '../omni';
import Address from './address';
import $ from 'jquery';


export default class Account {
  constructor(data){
    this.data = data;
  }

  name() {
    return this.data.name;
  }

  firstName() {
    return this.data.first_name;
  }

  lastName() {
    return this.data.last_name;
  }

  email() {
    return this.data.email;
  }

  id() {
    return this.data.id || 'anonymous';
  }

  discountCode(val) {
    if (val === undefined) {
      return this.data.discount_code;
    }else{
      else this.data.discount_code = val;
      return this;
    }    
  }

  pricingPlan(val) {
    if (val === undefined) { 
      return this.data.billing_plan || this.data.pricing_plan;
    }else{ 
      this.data.billing_plan = this.data.pricing_plan = val;
      return this;
    }
  }

  hasPricingPlan() {
    return !!this.pricingPlan();
  }

  hasPaymentCredentials(val) {
    if (val === undefined) {
      return !!this.data.payment_credentials_filled;
    }else {
      this.data.payment_credentials_filled = !!val;
      return this;
    }
  }

  isBillable() {
    return this.hasPaymentCredentials() && this.hasPricingPlan();
  }

  canCheckin() {
    return this.hasAddress() && this.hasPhone();
  }

  phone(val) {
    if (val === undefined) {
      return this.data.phone;
    }else {
      this.data.phone = val;
      return this;
    }
  }

  hasPhone() {
    return !!this.phone();
  }

  hasAddress() {
    return !!this.address();
  }

  address() {
    if (value === undefined) {
      return this.data.address ? new Address(this.data.address) : null;
    }else {
      this.data.address = value;
      return this;
    }
  }
}

omni.models.Account = Account;