"use strict";

import omni from '../omni';
import TimeSlot from './timeslot';

export default class TimeSlotGroup {
  constructor(data) {
    const slots =[];
    const instance = this;
    $.each(data, (_, data) => {
      const slot;
      if (data.datetime){
        const start = data.datetime * 1000;
        const price = parseFloat(data.amount);
        slot = new TimeSlot({ start: start, price: price });
      }else if (data.start){
        slot = new TimeSlot(data);
      }else if (data instanceof TimeSlot){
        slot = data;
      }
      if (slot) {
        slots.push(slot); 
      }else{
        throw new Error('Unacceptable TimeSlot data: ' + data);
      }
    });

    this.data = { timeSlots: slots }; 
  }

  timeSlots() {
    return this.data.timeSlots ? this.data.timeSlots : [];
  }

  timeSlot(i) {
    const slots = this.timeSlots();
    if (slots.length <= 0) {
      return null;
    } else if (slots.length > i) {
      if (i < 0) {
        return this.timeSlot(slots.length + i);
      }else {
        return slots[i];
      }
    } else {
      return null;
    }
  }

  timeSlotStartDate(i) {
    const slot = this.timeSlot(i);
    return slot ? slot.start() : null;
  }

  timeSlotStartDates() {
    return $.map(this.timeSlots(), (slot) => { 
      return slot.start();
    });
  }

  timeSlotDuration() {
    const slot = this.timeSlot(0);
    return slot ? slot.duration() : null;
  }

  day() {
    const start = this.timeSlotStartDate(0);
    return start ? new Date(start.setHours(0, 0, 0, 0)) : null;
  }
}

omni.models.TimeSlotGroup = TimeSlotGroup;