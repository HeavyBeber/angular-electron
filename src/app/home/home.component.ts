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

    let aDate = new DbDate(24, 8, 2019, 0);
    this.courseDates.push(aDate);

    aDate = new DbDate(31, 8, 2019, 5);
    this.courseDates.push(aDate);

    aDate = new DbDate(17, 8, 2019, 10);
    this.courseDates.push(aDate);
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
