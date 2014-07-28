'use strict';

/**
 * ## log
 *
 * `log` tag for Lo-Dash.
 *
 * **Example:**
 *
 * ```js
 * <%= log("Whoohoo!") %>
 * ```
 *
 * @param  {String} `msg` The message to output.
 */

module.exports = function(msg) {
  return console.log(msg);
};