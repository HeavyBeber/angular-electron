import { DbCustomer } from './db-customer';

describe('DbCustomer', () => {
  it('should create an instance', () => {
    expect(new DbCustomer(1, 'Roger', 'Halliday', 'Poppy', new Date(), 'CHIEN MORDEUR', 27)).toBeTruthy();
  });
});
