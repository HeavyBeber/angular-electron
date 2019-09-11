import { Injectable } from '@angular/core';
import { DbCustomer } from '../app/core/models/db-customer';
import { of } from 'rxjs';

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

  getCustomers() {
    this.fs.readFile('./database/customers.json', (err, data) => {
      if (err) {
        throw err;
      }
      this.customers = JSON.parse(data).sort(this.compareCustomers);
      return of(this.customers);
    });
  }

  getCustomerFromId(id: number) {
    for (const cust of this.customers) {
      if (cust.id === id) {
        return cust;
      }
    }
  }

  addCustomer(customer: DbCustomer) {
    this.pushInCustomers(customer);
    this.saveCustomers();
  }

  editCustomer(customer: DbCustomer) {
    this.removeFromCustomers(customer.id);
    this.pushInCustomers(customer);
    this.saveCustomers();
  }

  private compareCustomers(one: DbCustomer, other: DbCustomer) {
    const compFirstName = one.firstName.toLowerCase() < other.firstName.toLowerCase();
    const compLastName = one.firstName.toLowerCase() ===  other.firstName.toLowerCase() &&
                         one.lastName.toLowerCase() < other.lastName.toLowerCase();

    return (compLastName || compFirstName) ? -1 : 1;
  }

  private pushInCustomers(customer: DbCustomer) {
    if (this.customers.length === 0) {
      this.customers.push(customer);
    } else {
      const first = this.customers.shift();
      if (this.compareCustomers(customer, first)) {
        this.customers.unshift(first);
        this.customers.unshift(customer);
      } else {
        this.pushInCustomers(customer);
        this.customers.unshift(first);
      }
    }
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

}
