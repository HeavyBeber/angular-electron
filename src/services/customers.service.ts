import { Injectable } from '@angular/core';
import { DbCustomer } from '../app/core/models/db-customer';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  fs = require('fs');

  constructor() { }

  getCustomers() {
    this.fs.readFile('./database/customers.json', (err, data) => {
      if (err) {
        throw err;
      }
      return JSON.parse(data).sort(this.compareCustomers);
    });
  }

  compareCustomers(one: DbCustomer, other: DbCustomer) {
    const compFirstName = one.firstName.toLowerCase() < other.firstName.toLowerCase();
    const compLastName = one.firstName.toLowerCase() ===  other.firstName.toLowerCase() &&
                         one.lastName.toLowerCase() < other.lastName.toLowerCase();

    return (compLastName || compFirstName) ? -1 : 1;
  }
}
