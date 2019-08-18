export class DbCourse {
  constructor(public id: number,
              public day: number ,
              public month: number,
              public year: number,
              public maxAttendee: number,
              public attendees: number[]) { }
}
