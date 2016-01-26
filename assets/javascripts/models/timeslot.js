"use strict";

import omni from '../omni';


TimeSlot.DEFAULT_WINDOW = 1000 * 60 * 15; // fifteen minutes

export default class TimeSlot {
  constructor(data){
    if (!data.duration && !data.end) {
      data.duration = TimeSlot.DEFAULT_WINDOW;
    }
    if (!data.end) {
      data.end = new Date(data.start).getTime() + data.duration;
    }

    data.duration = data.end - data.start;
    this.data = data;
  }

  price() {
    return this.data.price;
  }

  duration() {
    return this.data.duration;
  }

  start() {
    return new Date(this.data.start);
  }

  end() {
    return new Date(this.data.end);
  }
}

omni.models.TimeSlot = TimeSlot;

