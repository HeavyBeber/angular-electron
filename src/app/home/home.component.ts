import { Component, OnInit } from '@angular/core';
import { DbCourse } from '../core/models/db-course';
import { DbCustomer } from '../core/models/db-customer';
import { CreateNewClientDialogComponent } from '../create-new-client-dialog/create-new-client-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Moment } from 'moment';
import { MAT_SORT_HEADER_INTL_PROVIDER_FACTORY } from '@angular/material/sort';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'}]
})
export class HomeComponent implements OnInit {

  courses: DbCourse[];
  customers: DbCustomer[];

  nextCourse: DbCourse = new DbCourse(0, 0, 0, 0, 0, []);

  selectedDate: Moment;
  selectedCourses: DbCourse[];

  selectedCustForCourse: DbCustomer;
  currentCourse: DbCourse;
  selectedCust: DbCustomer;


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
              this.compareCourses(new DbCourse(0, now.getDate(), now.getMonth(), now.getFullYear(), 0, []), course)) {
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
      data: {
        paidCourses: 0,
        stock: 0
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.pushCustomerInCustomers(new DbCustomer(this.nextCustomerId(),
                                                    result.firstName,
                                                    result.lastName,
                                                    result.puppy,
                                                    result.birthdate,
                                                    result.comments,
                                                    result.paidCourses));
        this.saveCustomers();
      }
    });
  }

  editCust(cust) {
    let custToUpdate = this.getCustFromId(cust.id);
    const dialogRef = this.dialog.open(CreateNewClientDialogComponent, {
      data: {
        firstName: custToUpdate.firstName,
        lastName: custToUpdate.lastName,
        puppy: custToUpdate.puppy,
        birthdate: custToUpdate.birthdate,
        comments: custToUpdate.comments,
        paidCourses: 0,
        stock: custToUpdate.paidCourses,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        custToUpdate = new DbCustomer( custToUpdate.id,
        result.firstName,
        result.lastName,
        result.puppy,
        result.birthdate,
        result.comments,
        result.paidCourses + result.stock);
        this.saveCust(custToUpdate);
      }
   });
  }

  saveCustomers() {
    const fs = require('fs');
    fs.writeFile('./database/customers.json', JSON.stringify(this.customers), (err) => {
      if (err) {
        throw err;
      }
    });
  }

  saveCourses() {
    const fs = require('fs');
    fs.writeFile('./database/courseDates.json', JSON.stringify(this.courses), (err) => {
      if (err) {
        throw err;
      }
    });
  }

  saveCourse(course: DbCourse) {
    this.courses = this.deleteFromArray(this.getCourseFromId(course.id), this.courses);
    this.pushCourseInCourses(course);
    this.saveCourses();
  }

  saveCust(cust: DbCustomer) {
    this.customers = this.deleteFromArray(this.getCustFromId(cust.id), this.customers);
    this.pushCustomerInCustomers(cust);
    this.saveCustomers();
  }

  nextCourseId() {
    let maxId = -1;
    for (const aCourse of this.courses) {
      if (aCourse.id > maxId) {
        maxId = aCourse.id;
      }
    }
    return maxId + 1 ;
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
    const compLastName = one.firstName < other.firstName;
    const compFirstName = one.firstName ===  other.firstName && one.lastName < other.lastName;

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
    const courseToAdd = new DbCourse(this.nextCourseId(),
                                    this.selectedDate.date(),
                                    this.selectedDate.month(),
                                    this.selectedDate.year(),
                                    10, []);
    this.pushCourseInCourses(courseToAdd);
    this.saveCourses();
  }

  isCourseSelected(c: DbCourse) {
    return this.selectedDate &&
           c.day === this.selectedDate.date() && c.month === this.selectedDate.month() && c.year === this.selectedDate.year();
  }

  getAttendees(course: DbCourse) {
    const result = [];
    for (const attendee of course.attendees) {
      result.push(this.attendeeToString(attendee));
    }
    return result;
  }

  attendeeToString(i: number) {
    const cust = this.getCustFromId(i);
    const now = new Date(Date.now());
    const ageInMonth = 12 * (now.getFullYear() - new Date(cust.birthdate).getFullYear()) +
                              now.getMonth() - new Date(cust.birthdate).getMonth();
    return cust.firstName + ' ' + cust.lastName + ', ' + cust.puppy + ' (' + ageInMonth + ')';
  }

  getCustomersString() {
    const result = [];
    for (const cust of this.customers) {
      const now = new Date(Date.now());
      const ageInMonth = 12 * (now.getFullYear() - new Date(cust.birthdate).getFullYear()) +
                                now.getMonth() - new Date(cust.birthdate).getMonth();
      result.push(cust.firstName + ' ' + cust.lastName + ', ' + cust.puppy + ' (' + ageInMonth + ')');
    }
    return result;
  }

  getCustFromText(c: string) {
    const stringTab = c.split(/[\s,(]+/);
    for (const cust of this.customers) {
      if (cust.firstName === stringTab[0] && cust.lastName === stringTab[1] && cust.puppy === stringTab[2]) {
        return cust;
      }
    }
  }

  handleSelectionCust(event) {
    if (event.option.selected) {
      event.source.deselectAll();
      event.option._setSelected(true);
      this.selectedCust = this.getCustFromText(event.option._text.nativeElement.innerText);
    }
  }

  handleSelection(event, course: DbCourse) {
    if (event.option.selected) {
      this.currentCourse = course;
      event.source.deselectAll();
      event.option._setSelected(true);
      this.selectedCustForCourse = this.getCustFromText(event.option._text.nativeElement.innerText);
    }
  }

  deleteFromArray(e: any, arr: any[]): any[] {
    console.log(e + ' ' + arr + ' enter method');
    if (arr.length === 0) {
      console.log(e + ' ' + arr + ' end empty');
      return arr;
    }
    const head = arr.shift();
    if (head === e) {
      console.log(e + ' ' + arr + ' end element found');
      return arr;
    }
    console.log(e + ' ' + arr + ' start rec');
    arr = this.deleteFromArray(e, arr);
    console.log(e + ' ' + arr + ' after rec');
    arr.unshift(head);
    console.log(e + ' ' + arr + ' put elem');
    return arr;
  }

  getCourseFromId(id: number) {
    for (const course of this.courses) {
      if (course.id === id) {
        return course;
      }
    }
  }

  getCustFromId(id: number) {
    for (const cust of this.customers) {
      if (cust.id === id) {
        return cust;
      }
    }
  }

  deleteFromCourse() {
    this.currentCourse.attendees = this.deleteFromArray(this.selectedCustForCourse.id, this.currentCourse.attendees);
    this.saveCourse(this.currentCourse);

    this.selectedCustForCourse.paidCourses = this.selectedCustForCourse.paidCourses + 1;
    this.saveCust(this.selectedCustForCourse);
    this.selectedCustForCourse = undefined;
  }

  deleteCust() {
    const newCourses = this.courses;
    this.courses = [];
    for (const course of newCourses) {
      course.attendees = this.deleteFromArray(this.selectedCust.id, course.attendees);
      this.pushCourseInCourses(course);
    }
    this.saveCourses();

    const newCusts = this.customers;
    this.customers = [];
    for (const cust of newCusts) {
      if (cust.id !== this.selectedCust.id) {
        this.pushCustomerInCustomers(cust);
      }
    }
    this.saveCustomers();
    this.selectedCust = undefined;
  }
}
