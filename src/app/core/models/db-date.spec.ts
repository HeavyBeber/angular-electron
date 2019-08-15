import { DbDate } from './db-date';

describe('DbDate', () => {
  it('should create an instance', () => {
    expect(new DbDate(24, 8, 2019, 0)).toBeTruthy();
  });
});
