"use strict";

import omni from '../omni';
import TimeSlot from './timeslot';

export default class SaleOrder {
  constructor(data){
    this.data = data;
  }

  orderNumber() {
    return this.data.order_number;
  }

  scheduledDate() {
    return new Date(this.data.scheduled_date + '  GMT-0000');
  }

  timeSlot() {
    return new TimeSlot({ start: this.scheduledDate().getTime() });
  }
}

omni.models.SaleOrder = SaleOrder;