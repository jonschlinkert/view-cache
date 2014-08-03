'use strict';

var glob = require('globby');
var arrayify = require('arrayify-compact');
var include = require('./include');
var _ = require('lodash');

/**
 * ## glob
 *
 * Include a glob of files.
 *
 * **Example:**
 *
 * ```js
 * <%= glob("*.md") %>
 * ```
 *
 * @param  {String} `patterns` File paths or glob patterns to use.
 * @return {String} Content string.
 */

module.exports = function (template) {
  var tmplOpts = template.options || {};
  return function (patterns, options) {
    var opts = _.extend({}, tmplOpts, options);
    var files = glob.sync(arrayify(patterns), opts);
    return files.map(function (filepath) {
      return include(filepath);
    }).join(opts.sep || '\n');
  };
};