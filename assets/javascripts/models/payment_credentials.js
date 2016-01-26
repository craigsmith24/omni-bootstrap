"use strict";

import omni from '../omni';

export default class PaymentCredentials {
  constructor(data){
    this.data = data;
  }

  id() {
    return this.data.id;
  }

  cardholderName() {
    return this.data.cardholder_name;
  }

  cardNumber() {
    return this.data.card_number; 
  }

  expirationMonth() {
    return this.data.expiration_month;
  }

  expirationYear() {
    return this.data.expiration_year;
  }

  cardType() {
    return this.data.card_type;
  }

  cardCVS() {
    return this.data.cvs;
  }

  zipCode() {
    return this.data.zip;
  }

  cardProvider() {
    return this.data.card_provider;
  }
}

omni.models.PaymentCredentials = PaymentCredentials;
