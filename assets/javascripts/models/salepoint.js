"use strict";

import omni from '../omni';


export default class SalePoint {
  constructor(data){
    this.data = data;
  }

  title() {
    return this.data.title;
  }

  street() {
    return this.data.street;
  }
}

omni.models.SalePoint = SalePoint;