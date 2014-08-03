

/**
 * ## .makeTag
 *
 * Generate the default body tag to use as a fallback, based on the
 * `tag` and `delims` defined in the options.
 *
 * @param  {Object} options
 * @return {String} The actual body tag, e.g. `{{ body }}`
 * @api private
 */

var makeTag = function (options) {
  var opts = _.defaults({}, options, this.options);
  return [
    opts.delims[0],
    opts.tag,
    opts.delims[1]
  ].join(opts.sep || ' ');
};


/**
 * ## .makeRegex
 *
 * Return a regular expression for the "body" tag based on the
 * `tag` and `delims` defined in the options.
 *
 * @param  {Object} `options`
 * @return {RegExp}
 * @api private
 */

var makeRegex = function (options) {
  var opts = _.extend({sep: '\\s*'}, this.options, options);
  var tag = this.makeTag(opts).replace(/[\]()[{|}]/g, '\\$&');
  return new RegExp(tag, opts.flags || 'g');
};
