'use strict';

/**
 * ## .makeRegex
 *
 * Generate the default body tag to use as a fallback, based on the
 * `tag` and `delims` defined in the options.
 *
 * @param  {Object} options
 * @return {String} The actual body tag, e.g. `{{ body }}`
 * @api private
 */

var makeRegex = function (options) {
  var opts = _.defaults({}, options, this.options);
  return [
    opts.delims[0],
    opts.tag,
    opts.delims[1]
  ].join(opts.sep || ' ');
};


/**
 * ## .block
 *
 * Return a regular expression for a block helper based on the
 * `tag` and `delims` defined in the options.
 *
 * @param  {Object} `options`
 * @return {RegExp}
 * @api private
 */

module.exports = function (options) {
  var opts = _.extend({sep: '\\s*'}, this.options, options);
  var tag = this.makeRegex(opts).replace(/[\]()[{|}]/g, '\\$&');
  return new RegExp(tag, opts.flags || 'g');
};
