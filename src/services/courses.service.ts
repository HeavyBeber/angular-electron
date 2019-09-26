import { Injectable } from '@angular/core';
import { DbCourse } from '../app/core/models/db-course';
import { Observable, of } from 'rxjs';
import { Moment } from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  fs = require('fs');

  courses: DbCourse[];

  constructor() { }

  saveCourses() {
    this.fs.writeFile('./database/courseDates.json', JSON.stringify(this.courses, null, 2), (err) => {
      if (err) {
        throw err;
      }
    });
  }

  getCourses(): Observable<DbCourse[]> {
    const data = this.fs.readFileSync('./database/courseDates.json', 'utf-8');
    this.courses = JSON.parse(data).sort(this.compareCourses);
    return of(this.courses);
  }

  getCourseFromId(id: number) {
    for (const course of this.courses) {
      if (course.id === id) {
        return of(course);
      }
    }
    throw new Error('No course with id : ' + id + ' in database');
  }

  deleteCourse(id: number) {
    this.courses = this.courses.filter(course => course.id !== id);
    this.saveCourses();
    return of(this.courses);
  }

  createCourse(date: Moment, capacity: number) {
    const courseToAdd = new DbCourse(this.nextCourseId(),
                    date.date(),
                    date.month(),
                    date.year(),
                    capacity, []);
    this.pushInCourses(courseToAdd);
    this.saveCourses();
    return of(this.courses);
  }

  getNextCourseDate() {
    const now = new Date(Date.now());
    let nextCourseDate = 'Pas de cours prévu';
    for (const course of this.courses) {
      if (this.compareCourses(new DbCourse(-1, now.getDate(), now.getMonth(), now.getFullYear(), 0, []), course) === -1) {
        nextCourseDate = this.toDateString(course);
        return of(nextCourseDate);
      }
    }
    return of(nextCourseDate);
  }

  removeCustomerFromAllCourses(custId: number) {
    const newCourses = [];
    for (const course of this.courses) {
      course.attendees = course.attendees.filter(attendee => attendee !== custId);
    }
    this.saveCourses();
    return of(newCourses);
  }

  removeCustomerFromACourse(custId: number, courseId: number) {
    for (const course of this.courses) {
      if (course.id === courseId) {
        course.attendees = course.attendees.filter(attendee => attendee !== custId);
        this.saveCourses();
        return of(course);
      }
    }
    throw new Error('No course with id : ' + courseId + ' in database');
  }

  addCustomerToACourse(custId: number, courseId: number) {
    for (const course of this.courses) {
      if (course.id === courseId) {
        course.attendees.push(custId);
        this.saveCourses();
        return of(this.courses);
      }
    }
    throw new Error('No course with id : ' + courseId + ' in database');
  }

  private compareCourses(one: DbCourse, other: DbCourse) {
    const compYear = one.year < other.year;
    const compMonth = one.year === other.year && one.month < other.month;
    const compDay = one.year === other.year && one.month === other.month && one.day < other.day;
    const compId = one.year === other.year && one.month === other.month && one.day === other.day && one.id < other.id;

    return (compYear || compMonth || compDay || compId) ? -1 : 1;
  }

  private formatMonth(month: number) {
    const realMonth = month + 1;

    if (realMonth.toString().length === 1) {
      return '0' + realMonth;
    }
    return realMonth;
  }

  private toDateString(course: DbCourse) {
    return course.day + '/' + this.formatMonth(course.month) + '/' + course.year;
  }

  private pushInCourses(course: DbCourse) {
    this.courses.push(course);
    this.courses.sort(this.compareCourses);
  }

  private nextCourseId() {
    let maxId = -1;
    for (const aCourse of this.courses) {
      if (aCourse.id > maxId) {
        maxId = aCourse.id;
      }
    }
    return maxId + 1 ;
  }
}
