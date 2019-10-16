import { Component, OnInit } from '@angular/core';
import { DbCourse } from '../core/models/db-course';
import { DbCustomer } from '../core/models/db-customer';
import { CreateNewClientDialogComponent } from '../create-new-client-dialog/create-new-client-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Moment } from 'moment';
import { SelectCourseComponent } from '../select-course/select-course.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomersService } from '../../services/customers.service';
import { CoursesService } from '../../services/courses.service';

import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';

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

  nextCourseDate: string;

  selectedDate: Moment;
  selectedCourses: DbCourse[] = [];

  selectedCustForCourse: DbCustomer;
  currentCourse: DbCourse;
  selectedCust: DbCustomer;
  chosenCourseId: number;

  prevCustOpt: any;
  prevCustForCourseOpt: any;
  customerFilter = '';

  constructor(public dialog: MatDialog, public _snackBar: MatSnackBar,
    private customerService: CustomersService, private courseService: CoursesService) {
  }

  ngOnInit() {
    this.getCourses();
    this.getCustomers();
  }

  getCustomers() {
    this.customerService.getCustomers().subscribe(customers => this.customers = customers);
  }

  getCourses() {
    this.courseService.getCourses().subscribe(courses => this.courses = courses);
    this.courseService.getNextCourseDate().subscribe(nextDate => this.nextCourseDate = nextDate);
  }

  deleteACourse(courseId: number) {
    this.courseService.getCourseFromId(courseId).subscribe(course => {
      const attendees = course.attendees;
      for (const attendee of attendees) {
        this.customerService.refundACourse(attendee).subscribe(customers => this.customers = customers);
        this.selectedCustForCourse = undefined;
      }
    });
    this.courseService.deleteCourse(courseId).subscribe(courses => this.courses = courses);
  }

  openCustomerDialog(): void {
    const dialogRef = this.dialog.open(CreateNewClientDialogComponent, {
      data: {
        paidCourses: 0,
        stock: 0,
        isEdit: false
      },
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customerService.addCustomer(new DbCustomer(this.nextCustomerId(),
          result.isStudent,
          result.firstName,
          result.lastName,
          result.puppy,
          result.race,
          result.birthdate,
          result.comments,
          result.email,
          result.phoneNumber,
          result.paidCourses
        )).subscribe(customers => this.customers = customers);
      }
    });
  }

  editCust(cust) {
    let custToUpdate;
    this.customerService.getCustomerFromId(cust.id).subscribe(customer => custToUpdate = customer);
    const dialogRef = this.dialog.open(CreateNewClientDialogComponent, {
      data: {
        isEdit: true,
        isStudent: custToUpdate.isStudent,
        firstName: custToUpdate.firstName,
        lastName: custToUpdate.lastName,
        puppy: custToUpdate.puppy,
        race: custToUpdate.race,
        birthdate: custToUpdate.birthdate,
        comments: custToUpdate.comments,
        email: custToUpdate.email,
        phoneNumber: custToUpdate.phoneNumber,
        paidCourses: 0,
        stock: custToUpdate.paidCourses,
      },
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        custToUpdate = new DbCustomer( custToUpdate.id,
          result.isStudent,
          result.firstName,
          result.lastName,
          result.puppy,
          result.race,
          result.birthdate,
          result.comments,
          result.email,
          result.phoneNumber,
          result.paidCourses + result.stock);
          this.customerService.editCustomer(custToUpdate).subscribe(customers => this.customers = customers);
      }
   });
  }

  openCourseChoice(mode: string): void {
    const selectedCoursesId = [];
    for (const course of this.selectedCourses) {
      selectedCoursesId.push(course.id);
    }

    const dialogRef = this.dialog.open(SelectCourseComponent, {
      data: {
        courseList: selectedCoursesId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (mode === 'delete') {
          const date = this.selectedDate.date() + '/' + this.formatMonth(this.selectedDate.month()) + '/' + this.selectedDate.year();
          if (confirm('Voulez-vous vraiment supprimer le cours du ' + date + ' ?')) {
            this.deleteACourse(result.chosenId);
            this._snackBar.open('Cours supprimé', 'x', {
              duration: 5000
            });
          }
        } else {
          const custId = parseInt(mode, 10);
          let cust;
          this.customerService.getCustomerFromId(custId).subscribe(customer =>  {
            cust = customer;
            this._snackBar.open(cust.firstName + ' ' + cust.lastName + ' ajouté au cours', 'x', {
              duration: 5000
            });
          });
          this.customerService.payACourse(custId).subscribe(customers => this.customers = customers);
          this.courseService.addCustomerToACourse(custId, result.chosenId).subscribe(courses => this.courses = courses);
        }
      }
    });

  }



  /* A deplacer dans customerService.
   * Il faut avant revoir openCustomerDialog
   */
  nextCustomerId() {
    let maxId = -1;
    for (const aCust of this.customers) {
      if (aCust.id > maxId) {
        maxId = aCust.id;
      }
    }
    return maxId + 1 ;
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

  formatMonth(month: number) {
    const realMonth = month + 1;

    if (realMonth.toString().length === 1) {
      return '0' + realMonth;
    }
    return realMonth;
  }

  getSelectedDate() {
    this.getSelectedCourses();
    if (this.selectedDate) {
      return this.selectedDate.date() + '/' + this.formatMonth(this.selectedDate.month()) + '/' + this.selectedDate.year();
    }
    return 'Pas de date sélectionnée';
  }

  createCourse() {
    this.courseService.createCourse(this.selectedDate, 10).subscribe(courses => this.courses =  courses);
    this._snackBar.open('Cours créé', 'x', {
      duration: 5000
    });
  }

  isCourseSelected(c: DbCourse) {
    return this.selectedDate &&
           c.day === this.selectedDate.date() && c.month === this.selectedDate.month() && c.year === this.selectedDate.year();
  }

  getSelectedCourses() {
    this.selectedCourses = [];
    for (const course of this.courses) {
      if (this.isCourseSelected(course)) {
        this.selectedCourses.push(course);
      }
    }
    if (this.selectedCourses.length === 0) {
      this.selectedCustForCourse = null;
    }
  }

  /* A Déplacer dans customerService avec attendeeToString et getCustomersString et getCustFromText*/
  getAttendees(course: DbCourse) {
    let result = [];
    this.customerService.getAttendeesString(course.attendees).subscribe(res => result = res);
    return result;
  }

  getCustomersString() {
    let result = [];
    this.customerService.getAttendeesString([-1]).subscribe(res => result = res);
    return result.filter(x => x.toLowerCase().includes(this.customerFilter.toLowerCase()));
  }

  getCustFromText(c: string) {
    const custString = c.replace(/\s/g, '');
    for (const cust of this.customers) {
      if (custString.includes(cust.lastName.replace(/\s/g, '')) &&
          custString.includes(cust.firstName.replace(/\s/g, '')) &&
          custString.includes(cust.puppy.replace(/\s/g, '')) &&
          custString.includes(cust.race.replace(/\s/g, ''))) {
        return cust;
      }
    }
  }

  getCustomerSize() {
    const res = this.getCustomersString().length;
    if (res.toString().length === 1) {
      return '0' + res;
    }
    return res;
  }

  handleSelectionCust(event) {
    if (event.option.selected) {
      if (this.prevCustOpt) {
        this.prevCustOpt._setSelected(false);
      }
      event.source.deselectAll();
      event.option._setSelected(true);
      this.prevCustOpt = event.option;
      this.selectedCust = this.getCustFromText(event.option._text.nativeElement.innerText);
    } else {
      this.selectedCust = null;
    }
  }

  handleSelection(event, course: DbCourse) {
    if (event.option.selected) {
      if (this.prevCustForCourseOpt) {
        this.prevCustForCourseOpt._setSelected(false);
      }
      this.currentCourse = course;
      event.source.deselectAll();
      event.option._setSelected(true);
      this.prevCustForCourseOpt = event.option;
      this.selectedCustForCourse = this.getCustFromText(event.option._text.nativeElement.innerText);
    } else {
      this.currentCourse = null;
      this.selectedCustForCourse = null;
    }
  }

  deleteFromCourse() {
    this.courseService.removeCustomerFromACourse(this.selectedCustForCourse.id, this.currentCourse.id)
                                      .subscribe(course => this.currentCourse = course);
    this.customerService.refundACourse(this.selectedCustForCourse.id).subscribe(customers => this.customers = customers);

    this._snackBar.open(this.selectedCustForCourse.firstName + ' ' + this.selectedCustForCourse.lastName + ' retiré du cours', 'x', {
      duration: 5000
    });
    this.selectedCustForCourse = undefined;
  }

  deleteCust() {
    const confirmMessage = 'Voulez-vous vraiment supprimer ' + this.selectedCust.firstName + ' ' + this.selectedCust.lastName + ' ?';
    if (confirm(confirmMessage)) {
      this.courseService.removeCustomerFromAllCourses(this.selectedCust.id).subscribe(courses => this.courses = courses);
      this.customerService.deleteCustomer(this.selectedCust.id).subscribe(customers => this.customers = customers);
      this.selectedCust = undefined;
      this._snackBar.open('Client supprimé', 'x', {
        duration: 5000
      });
    }
  }

  getTabNumbers() {
    const result = [];
      if (this.customers) {
        for (let i = 0 ; i < this.getCustomersString().length / 5 ; i++ ) {
          result.push(i);
        }
      }
    return result;
  }

  getTabCustomersString(i) {
    const result = [];
    this.getCustomersString().forEach((item, index) => {
      if (index >= i * 5 && index < i * 5 + 5) {
        result.push(item);
      }
    });
    return result;
  }

  getTabTitle(i) {
    const tabString: string[] = this.getTabCustomersString(i);
    const first = tabString[0].substring(0, 1) + tabString[0].substring(1, 2).toLowerCase();
    const last = tabString[tabString.length - 1].substring(0, 1) + tabString[tabString.length - 1].substring(1, 2).toLowerCase();
    return first + '-' + last;
  }

  addCustToSelectedCourse(cust) {
    this.getSelectedCourses();
    if (this.selectedCourses.length === 1) {
      if (this.selectedCourses[0].attendees.indexOf(cust.id) === -1) {
        this.courseService.addCustomerToACourse(cust.id, this.selectedCourses[0].id)
                                      .subscribe(course => this.getSelectedCourses[0] = course);
        this.customerService.payACourse(cust.id).subscribe(customers => this.customers = customers);
        this._snackBar.open(cust.firstName + ' ' + cust.lastName + ' ajouté au cours', 'x', {
          duration: 5000
        });
      }
    } else {
      this.openCourseChoice(cust.id);
    }
  }

  deleteCourse() {
    this.getSelectedCourses();
    if (this.selectedCourses.length === 1) {
      const date = this.selectedCourses[0].day + '/' + this.formatMonth(this.selectedCourses[0].month) + '/' + this.selectedCourses[0].year;
      if (confirm('Voulez-vous vraiment supprimer le cours du ' + date + ' ?')) {
        this.deleteACourse(this.selectedCourses[0].id);
        this._snackBar.open('Cours supprimé', 'x', {
          duration: 5000
        });
      }
    } else {
      this.openCourseChoice('delete');
    }
  }

  public captureScreen() {
    const data = document.getElementById('contentToConvert');
    html2canvas(data).then(canvas => {
      // Few necessary setting options
      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
      const position = 0;
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      console.log('sa lut');
      pdf.save('MYPdf.pdf'); // Generated PDF
    });
  }

}
