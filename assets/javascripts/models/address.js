"use strict";


import omni from '../omni';


const DEFAULT_STREET = /1150 illinois st/gi;


export default class Address {
  constructor(data){
    this.data = data;
  }

  title() {
    return this.data.title;
  }

  apt() {
    return this.data.apt;
  }

  street() {
    const street = this.data.street;
    if (DEFAULT_STREET.test(street)) {
      return '';
    }else{
      return street;
    }
  }

  city() {
    return this.data.city;
  }

  state(){
    return this.data.state;
  }

  formatted() {
    return this.data.formated_address;
  }

  zip() {
    return this.data.zip;
  }
}

omni.models.Address = Address;