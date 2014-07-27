var fs = require('fs');

/**
 * ## Include
 *
 * `include` tag for Lo-Dash.
 *
 * **Example:**
 *
 * ```js
 * <%= include("doc.md") %>
 * ```
 *
 * @param  {String} `filepath`
 * @return {String} Content string.
 */

module.exports = function (cache) {
  return function (name) {
    return cache[name];
  }
};