import { DbCourse } from './db-course';

describe('DbCourse', () => {
  it('should create an instance', () => {
    expect(new DbCourse(0, 24, 8, 2019, 2, [1, 2])).toBeTruthy();
  });
});
