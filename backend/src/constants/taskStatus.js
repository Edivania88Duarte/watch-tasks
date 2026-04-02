const ALLOWED = Object.freeze(['todo', 'in_progress', 'done']);
const SET = new Set(ALLOWED);

function isValid(status) {
  return typeof status === 'string' && SET.has(status);
}

module.exports = { ALLOWED, isValid };
