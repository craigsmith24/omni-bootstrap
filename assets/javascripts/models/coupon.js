"use strict";


import omni from '../omni';


export default class Coupon {
  
  constructor(data) {
    this.data = data;
  }

  code() {
    return $.trim(this.data.code).toUpperCase();
  }

  title() {
    return this.data.title;
  }

  subtitle() {
    return this.data.subtitle;
  }

  caption() {
    return this.data.caption;
  }

  image() {
    return this.data.image;
  }

}

omni.models.Coupon = Coupon;
