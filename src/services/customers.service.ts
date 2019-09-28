import { Injectable } from '@angular/core';
import { DbCustomer } from '../app/core/models/db-customer';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  fs = require('fs');

  customers: DbCustomer[];

  constructor() { }

  saveCustomers() {
    this.fs.writeFile('./database/customers.json', JSON.stringify(this.customers, null, 2), (err) => {
      if (err) {
        throw err;
      }
    });
  }

  getCustomers(): Observable<DbCustomer[]> {
    const data = this.fs.readFileSync('./database/customers.json', 'utf-8');
    this.customers = JSON.parse(data).sort(this.compareCustomers);
    return of(this.customers);
  }

  getCustomerFromId(id: number) {
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
    const compFirstName = one.lastName.toLowerCase() ===  other.lastName.toLowerCase() &&
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
    const age = (ageInMonth < 12 ) ? ageInMonth : Math.floor(ageInMonth / 12) + '.' + ageInMonth % 12;
    return cust.lastName + ' ' + cust.firstName + ', ' + cust.puppy + ' (' + cust.race + ' : ' + age + ')';
  }

}
