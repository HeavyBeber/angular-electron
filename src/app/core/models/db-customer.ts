export class DbCustomer {
  constructor(
    public id: number,
    public firstName: string,
    public lastName: string,
    public puppy: string,
    public race: string,
    public birthdate: Date,
    public comments: string,
    public paidCourses: number
  ) {}
}
