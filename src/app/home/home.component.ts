import { Component, OnInit } from '@angular/core';
import { DbCourse } from '../core/models/db-course';
import { DbCustomer } from '../core/models/db-customer';
import { CreateNewClientDialogComponent } from '../create-new-client-dialog/create-new-client-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Moment } from 'moment';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'}]
})
export class HomeComponent implements OnInit {

  selectedDate: Moment;
  courses: DbCourse[];
  customers: DbCustomer[];
  nextCourse: DbCourse = new DbCourse(0, 0, 0, 0, []);
  selectedCourses: DbCourse[];

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
      this.courses = [];
      this.customers = [];

      // tslint:disable-next-line: no-shadowed-variable
      const fs = require('fs');
      let objs: any;

      fs.readFile('./database/courseDates.json', (err, data) => {
        if (err) {
          throw err;
        }
        objs = JSON.parse(data);
        for (const  obj of objs) {
          this.pushCourseInCourses(obj);
        }
        for (const course of this.courses) {
          const now = new Date(Date.now());
          if (this.nextCourse.year === 0 &&
              this.compareCourses(new DbCourse(now.getDate(), now.getMonth(), now.getFullYear(), 0, []), course)) {
            this.nextCourse = course;
          }
        }
      });

      fs.readFile('./database/customers.json', (err, data) => {
        if (err) {
          throw err;
        }
        objs = JSON.parse(data);
        for (const  obj of objs) {
          this.pushCustomerInCustomers(obj);
        }
      });

  }

  openCustomerDialog(): void {
    const dialogRef = this.dialog.open(CreateNewClientDialogComponent, {
      data: {paidCourses: 0}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.pushCustomerInCustomers(new DbCustomer(this.nextCustomerId(),
                                                    result.firstName,
                                                    result.lastName,
                                                    result.puppy,
                                                    result.birthdate,
                                                    result.comments,
                                                    2));
        const fs = require('fs');
        fs.writeFile('./database/customers.json', JSON.stringify(this.customers), (err) => {
          if (err) {
            throw err;
          }
        });
      }
    });
  }

  nextCustomerId() {
    let maxId = -1;
    for (const aCust of this.customers) {
      if (aCust.id > maxId) {
        maxId = aCust.id;
      }
    }
    return maxId + 1 ;
  }

  pushCourseInCourses(course: DbCourse) {
    if (this.courses.length === 0) {
      this.courses.push(course);
    } else if (this.compareCourses(course, this.courses[0])) {
        this.courses.unshift(course);
    } else {
      const first = this.courses.shift();
      this.pushCourseInCourses(course);
      this.courses.unshift(first);
    }
  }

  pushCustomerInCustomers(customer: DbCustomer) {
    if (this.customers.length === 0) {
      this.customers.push(customer);
    } else if (this.compareCustomers(customer, this.customers[0])) {
        this.customers.unshift(customer);
    } else {
      const first = this.customers.shift();
      this.pushCustomerInCustomers(customer);
      this.customers.unshift(first);
    }
  }

  compareCourses(one: DbCourse, other: DbCourse) {
    const compYear = one.year < other.year;
    const compMonth = one.year === other.year && one.month < other.month;
    const compDay = one.year === other.year && one.month === other.month && one.day < other.day;

    return compYear || compMonth || compDay;
  }

  compareCustomers(one: DbCustomer, other: DbCustomer) {
    const compLastName = one.lastName < other.lastName;
    const compFirstName = one.lastName ===  other.lastName && one.firstName < other.firstName;

    return compLastName || compFirstName;
  }

  dateClass = (m: Moment) => {
    for (const aCourse of this.courses) {
      if (aCourse.day === m.date() && aCourse.month === m.month() && aCourse.year === m.year()) {
        if (m.isBefore(Date.now())) {
          return 'pastCourse';
        }
        if (aCourse.attendees.length === 0) {
          return 'courseIsEmpty';
        }
        if (aCourse.attendees.length >= aCourse.maxAttendee) {
          return 'courseIsFull';
        }
        return 'hasCourse';
      }
    }
    return undefined;
  }

  printDbCourse(courses: DbCourse[]) {
    let res = '';
    for (const aCourse of courses) {
      res += aCourse.year + '/' + aCourse.month + '/' + aCourse.day + ' ' + aCourse.attendees + '/' + aCourse.maxAttendee + ' ';
    }
    return res;
  }

  formatMonth(month: number) {
    const realMonth = month + 1;

    if (realMonth.toString().length === 1) {
      return '0' + realMonth;
    }
    return realMonth;
  }

  getNextDate() {
    return this.nextCourse.day + '/' + this.formatMonth(this.nextCourse.month) + '/' + this.nextCourse.year;
  }

  getSelectedDate() {
    if (this.selectedDate) {
      return this.selectedDate.date() + '/' + this.formatMonth(this.selectedDate.month()) + '/' + this.selectedDate.year();
    }
    return 'Pas de date sélectionnée';
  }

  createCourse() {
    const courseToAdd = new DbCourse(this.selectedDate.date(),
                                    this.selectedDate.month(),
                                    this.selectedDate.year(),
                                    10, []);
    this.pushCourseInCourses(courseToAdd);
    const fs = require('fs');
    fs.writeFile('./database/courseDates.json', JSON.stringify(this.courses), (err) => {
      if (err) {
        throw err;
      }
    });
  }

  isCourseSelected(c: DbCourse) {
    return this.selectedDate &&
           c.day === this.selectedDate.date() && c.month === this.selectedDate.month() && c.year === this.selectedDate.year();
  }

  getAttendees(course: DbCourse) {
    const result = [];
    for (const attendee of course.attendees) {
      result.push(this.getAttendee(attendee));
    }
    return result;
  }

  getAttendee(i: number){
    for (const cust of this.customers) {
      if (cust.id === i) {
        const now = new Date(Date.now());
        const ageInMonth = 12 * (now.getFullYear() - new Date(cust.birthdate).getFullYear()) + now.getMonth() - new Date(cust.birthdate).getMonth();
        return cust.firstName + ' ' + cust.lastName + ', ' + cust.puppy + ' (' + ageInMonth + ')';
      }
    }
  }
}
