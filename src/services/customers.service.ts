import { Injectable } from '@angular/core';
import { DbCustomer } from '../app/core/models/db-customer';
import { of, Observable } from 'rxjs';

// DB CONNECTION
const { Client } = require("@notionhq/client")

const SECRET = 'secret_sz1jZrzSm1OBaKEo9MdyiPtS5kIk6mR2xl5SOcLH5OC';
const DATABASE_ID = '58b4d808af0e4470b697a1e6566810e7'

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  // DB CONNECTION
  notion = new Client({
    auth: SECRET
  })

  fs = require('fs');

  customers: DbCustomer[] = [];

  constructor() {
  }


  saveCustomers() {
    this.fs.writeFile('./database/customers.json', JSON.stringify(this.customers, null, 2), (err) => {
      if (err) {
        throw err;
      }
    });
  }


  getCustomersNotion =
    async () => {
      const payload = {
        path: `databases/${DATABASE_ID}/query`,
        method: 'POST'
      }
      const res = await this.notion.request(payload);

      console.log(res);
      const customers = res.results.map((page) => {
        const customer = new DbCustomer(
          page.properties.ID.title[0].text.content,
          page.properties.isStudent.checkbox,
          page.properties.firstName.rich_text[0].text.content,
          page.properties.lastName.rich_text[0].text.content,
          page.properties.puppy.rich_text[0].text.content,
          page.properties.race.rich_text[0].text.content,
          page.properties.birthdate.date.start,
          page.properties.comment.rich_text[0].text.content,
          page.properties.email.email,
          page.properties.phoneNumber.phone_number,
          page.properties.paidCourses.number
        );
        console.log(customer);
        this.pushInCustomers(customer);
      })
    }

  getCustomers(): Observable<DbCustomer[]> {
    this.getCustomersNotion();
    return of(this.customers);
  }

  getCustomerFromId(id: number) {
    const yop = async () => {
      const payload = {
        path: `databases/${DATABASE_ID}/query`,
        method: 'POST',
        filter: '{ID: 2'
      }
      const customer = await this.notion.request(payload);
      console.log(customer);
    }
    yop();
    for (const cust of this.customers) {
      if (cust.id === id) {
        return of(cust);
      }
    }
  }

  addCustomer(customer: DbCustomer) {
    this.pushInCustomers(customer);
    this.saveCustomers();
    return of(this.customers);
  }

  editCustomer(customer: DbCustomer) {
    this.removeFromCustomers(customer.id);
    this.pushInCustomers(customer);
    this.saveCustomers();
    return of(this.customers);
  }

  deleteCustomer(customerId: number) {
    this.removeFromCustomers(customerId);
    this.saveCustomers();
    return of(this.customers);
  }

  payACourse(customerId: number) {
    for (const cust of this.customers) {
      if (cust.id === customerId) {
        cust.paidCourses -= 1;
      }
    }
    this.saveCustomers();
    return of(this.customers);
  }

  refundACourse(customerId: number) {
    for (const cust of this.customers) {
      if (cust.id === customerId) {
        cust.paidCourses += 1;
      }
    }
    this.saveCustomers();
    return of(this.customers);
  }

  getAttendeesString(custIds: number[]) {
    const result = [];
    if (custIds.includes(-1)) {
      this.customers.forEach(customer => result.push(this.toString(customer)));
    } else {
      for (const cust of this.customers.filter(customer => custIds.includes(customer.id))) {
        result.push(this.toString(cust));
      }
    }
    return of(result);
  }

  private compareCustomers(one: DbCustomer, other: DbCustomer) {
    const compLastName = one.lastName.toLowerCase() < other.lastName.toLowerCase();
    const compFirstName = one.lastName.toLowerCase() === other.lastName.toLowerCase() &&
      one.firstName.toLowerCase() < other.firstName.toLowerCase();

    return (compLastName || compFirstName) ? -1 : 1;
  }

  private pushInCustomers(customer: DbCustomer) {
    this.customers.push(customer);
    this.customers.sort(this.compareCustomers);
  }

  private removeFromCustomers(id: number) {
    if (this.customers.length === 0) {

    } else {
      const first = this.customers.shift();
      if (first.id === id) {

      } else {
        this.removeFromCustomers(id);
        this.customers.unshift(first);
      }

    }
  }

  private toString(cust: DbCustomer) {
    const now = new Date(Date.now());
    const ageInMonth = 12 * (now.getFullYear() - new Date(cust.birthdate).getFullYear()) +
      now.getMonth() - new Date(cust.birthdate).getMonth();
    const age = (ageInMonth < 12) ? ageInMonth : Math.floor(ageInMonth / 12) + '.' + ageInMonth % 12;
    const isStudentString = cust.isStudent ? ' (E)' : '';
    return cust.lastName + ' ' + cust.firstName + ', ' + cust.puppy + ' (' + cust.race + ' : ' + age + ')' + isStudentString;
  }

}
