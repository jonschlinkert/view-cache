'use strict';

var matter = require('gray-matter');
var _ = require('lodash');

/**
 * ## .parse
 *
 * Parse a string and extract yaml front matter.
 *
 * **Example:**
 *
 * ```js
 * template.parse('---\ntitle: Home\n---\n<%= title %>');
 * //=> {data: {title: "Home"}, content: "<%= title %>"}}
 * ```
 *
 * @param  {String} `str` The string to parse.
 * @param  {String} `Options` options to pass to [gray-matter].
 * @return {String}
 * @api public
 */

module.exports = function matterParser(str, options) {
  var file = matter(str, _.defaults({
    autodetect: true
  }, options));

  file.content = file.content.replace(/^\s*/, '');
  return file;
};