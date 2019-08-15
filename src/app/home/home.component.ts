import { Component, OnInit } from '@angular/core';
import { DbDate } from '../core/models/db-date';

import * as fs from 'fs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  courseDates: DbDate[];

  constructor() { }

  ngOnInit() {
    this.courseDates = [];

    // tslint:disable-next-line: no-shadowed-variable
    const fs = require('fs');
    let objs: any;

    fs.readFile('src/assets/courseDates.json', (err, data) => {
      if (err) {
        throw err;
      }
      objs = JSON.parse(data);
      for (const  obj of objs) {
        this.courseDates.push(obj);
      }
    });


  }



  hasCourse(d: Date) {
    for (const aDate of this.courseDates) {
      if (aDate.day === d.getDate() && aDate.month === d.getMonth() + 1 && aDate.year === d.getFullYear()) {
        return true;
      }
    }
    return false;
  }

  dateClass = (d: Date) => {
    for (const aDate of this.courseDates) {
      if (aDate.day === d.getDate() && aDate.month === d.getMonth() + 1 && aDate.year === d.getFullYear()) {
        if (aDate.attendees === 0) {
          return 'courseIsEmpty';
        }
        if (aDate.attendees === 10) {
          return 'courseIsFull';
        }
        return 'hasCourse';
      }
    }
    return undefined;
  }

}
