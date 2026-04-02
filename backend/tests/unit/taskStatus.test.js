const taskStatus = require('../../src/constants/taskStatus');

describe('taskStatus', () => {
  test('isValid aceita valores permitidos', () => {
    expect(taskStatus.isValid('todo')).toBe(true);
    expect(taskStatus.isValid('in_progress')).toBe(true);
    expect(taskStatus.isValid('done')).toBe(true);
  });

  test('isValid rejeita valores inválidos', () => {
    expect(taskStatus.isValid('open')).toBe(false);
    expect(taskStatus.isValid('')).toBe(false);
    expect(taskStatus.isValid(null)).toBe(false);
  });
});
