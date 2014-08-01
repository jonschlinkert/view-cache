/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var isAbsolute = require('is-absolute');
var lookup = require('lookup-path');
var glob = require('globby');


/**
 * Initialize a new `View` with the given `name`.
 *
 * Options:
 *
 *   - `defaultEngine` the default template engine name
 *   - `engines` template engine require() cache
 *   - `root` root path for view lookup
 *
 * @param {String} name
 * @param {Object} options
 * @api private
 */

function View(name, options) {
  options = options || {};
  this.name = name;
  this.defaultEngine = options.defaultEngine;
  var ext = this.ext = path.extname(name);

  if (!ext && !this.defaultEngine) {
    throw new Error('No default engine was specified and no extension was provided.');
  }
  if (!ext) {
    name += (ext = this.ext = (this.defaultEngine[0] !== '.' ? '.' : '') + this.defaultEngine);
  }

  var engines = options.engines;
  console.log(engines)
  this.engine = engines[ext] || (engines[ext] = require(ext.slice(1)).__express);
  this.path = this.lookup(name);
}


/**
 * Lookup view by the given `path`
 *
 * @param {String} path
 * @return {String}
 * @api private
 */

View.prototype.lookup = function (filepath, cwd) {
  return lookup(filepath, cwd);
};


/**
 * Render with the given `options` and callback `fn(err, str)`.
 *
 * @param {Object} options
 * @param {Function} fn
 * @api private
 */

View.prototype.render = function (options) {
  var str = fs.readFileSync(this.path, 'utf8');
  return this.engine(str, options);
};



/**
 * Expose `View`.
 */

module.exports = View;