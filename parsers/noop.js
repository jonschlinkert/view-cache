'use strict';

module.exports = function noopParser (str, locals) {
  return {
    original: str,
    content: str,
    data: locals || {}
  }
};