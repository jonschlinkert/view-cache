/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var _ = require('lodash');
var Layouts = require('layouts');
var Delimiters = require('delims');
var delimiters = new Delimiters();


/**
 * ## Template
 *
 * Create a new instance of `Template`, optionally passing the default
 * `context` and `options` to use.
 *
 * **Example:**
 *
 * ```js
 * var Template = require('template');
 * var template = new Template();
 * ```
 *
 * @class `Template`
 * @param {Object} `context` Context object to start with.
 * @param {Object} `options` Options to use.
 * @api public
 */

function Template(context, options) {
  this.context = context || {};
  this.options = options || {};
  var opts = this.options;
  this.delims = {};
  this.cache = {};

  this.set('cwd', opts.cwd || process.cwd());
  this.engine = _.template || opts.engine;

  this.addDelims('default', ['<%', '%>']);
  this.addDelims('es6', ['${', '}'], {
    interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
  });

  this._cache('partials', opts.partials || {});
  this._cache('layouts', opts.layouts || {});
  this._cache('tags', opts.tags || {});

  this._layouts = new Layouts(opts);
  this._defaultTags();
}


/**
 * ## .makeDelims
 *
 * Pass custom delimiters to Lo-Dash.
 *
 * **Example:**
 *
 * ```js
 * template.makeDelimes(['{%', '%}'], opts);
 * ```
 *
 * @param  {Array} `array` Array of delimiters.
 * @param  {Object} `options` Options to pass to [delims].
 * @api private
 */

Template.prototype.makeDelims = function (array, options) {
  return delimiters.templates(array, _.defaults({
    escape: true
  }, options));
};


/**
 * ## .addDelims
 *
 * Store delimiters by `name` with the given `options` for later use.
 *
 * **Example:**
 *
 * ```js
 * template.addDelims('curly', ['{%', '%}']);
 * template.addDelims('angle', ['<%', '%>']);
 * template.addDelims('es6', ['${', '}'], {
 *   // override the generated regex
 *   interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
 * });
 * ```
 *
 * [delims]: https://github.com/jonschlinkert/delims "Generate regex for delimiters"
 *
 * @param {String} `name` The name to use for the stored delimiters.
 * @param {Array} `delimiterArray` Array of delimiter strings. See [delims] for details.
 * @param {Object} `options` Options to pass to [delims].
 * @api public
 */

Template.prototype.addDelims = function (name, delimiterArray, options) {
  var delims = _.extend({}, this.makeDelims(delimiterArray, options), options);
  this.constant(name, delims, this.delims);
  return this;
};


/**
 * ## .setDelims
 *
 * User-defined template delimiters to use.
 *
 * ```js
 * template.setDelims('curly');
 * console.log(template.process('{%= name %}<%= name %>', {name: 'Jon'}));
 * //=> 'Jon<%= name %>'
 *
 * template.setDelims('angle');
 * console.log(template.process('{%= name %}<%= name %>', {name: 'Jon'}));
 * //=> '{%= name %}Jon'
 * ```
 *
 * @param {String} `name`
 * @api public
 */

Template.prototype.setDelims = function(name) {
  return this.currentDelims = name;
};


/**
 * ## .getDelims
 *
 * The `name` of the stored delimiters to pass to the current template engine.
 * The engine must support custom delimiters for this to work.
 *
 * @param  {Array} `name` The name of the stored delimiters to pass.
 * @api private
 */

Template.prototype.getDelims = function(name) {
  return this.delims[name || this.currentDelims || 'default'];
};


/**
 * Private method for adding values to `this.cache`.
 *
 * @param  {String} `key`
 * @param  {*} value
 * @return {Template} to enable chaining.
 * @api private
 */

Template.prototype._cache = function(key, value) {
  this.constant(key, value, this.cache);
  return this;
};


/**
 * ## .constant
 *
 * Set a constant on the cache.
 *
 * **Example**
 *
 * ```js
 * template.constant('root', '/foo/bar/');
 * ```
 *
 * @method `constant`
 * @param {String} `key`
 * @param {*} `value`
 * @return {Template} to enable chaining.
 * @chainable
 * @api private
 */

Template.prototype.constant = function(key, value, obj) {
  var getter;
  if (typeof value !== 'function'){
    getter = function() {
      return value;
    };
  } else {
    getter = value;
  }
  obj = obj || this;
  obj.__defineGetter__(key, getter);
  return this;
};


/**
 * Extend the context.
 *
 * @param  {[type]} key
 * @param  {[type]} value
 * @return {[type]}
 */

Template.prototype.context = function (key, value) {
  this.context[key] = value;
  return this;
};

Template.prototype.data = function (key, value) {
  this.data[key] = value;
  return this;
};


/**
 * ## .addtag
 *
 * Add a custom template tag.
 *
 * **Example:**
 *
 * ```js
 * template.addTag('include', function(filepath) {
 *   return fs.readFileSync(filepath, 'utf8');
 * });
 * ```
 * **Usage:**
 *
 * ```js
 * template.process('<%= include("foo.md") %>');
 * ```
 *
 * @param  {String} `key`
 * @param  {Object} `value`
 * @return {Template} to enable chaining.
 * @chainable
 * @api public
 */

Template.prototype.addTag = function (key, value) {
  this.cache.tags[key] = value;
  return this;
};


/**
 * ## ._defaultTags
 *
 * Add default tags to the cache.
 *
 * @api private
 */

Template.prototype._defaultTags = function () {
  this.addTag('partial', function (name) {
    return this.cache.partials[name];
  }.bind(this));
};


/**
 * ## .partial
 *
 * Add a partial to `cache.partials`.
 *
 * @param  {String} `key`
 * @param  {Object} `value`
 * @return {Template} to enable chaining.
 * @chainable
 * @api public
 */

Template.prototype.partial = function (key, value) {
  if (arguments.length === 1) {
    if (typeof key === 'object') {
      this.partials(key);
      return this;
    }
    return this.cache.partials[key];
  }
  this.cache.partials[key] = value;
  return this;
};


/**
 * ## .partials
 *
 * Add an object of partials to `cache.partials`.
 *
 * @param {Arguments}
 * @return {Template} to enable chaining.
 * @chainable
 * @api public
 */

Template.prototype.partials = function (/*object*/) {
  if (arguments.length === 0) {
    return this.cache.partials;
  }

  var args = [].slice.call(arguments);
  _.extend.apply(_, [this.cache.partials].concat(args));
  return this;
};


/**
 * ## .layout
 *
 * Add a layout to `cache.layouts`.
 *
 * @param  {String} `key`
 * @param  {Object} `value`
 * @return {Template} to enable chaining.
 * @chainable
 * @api public
 */

Template.prototype.layout = function (key, str, data) {
  if (arguments.length === 1) {
    if (typeof key === 'object') {
      this._layouts.set(key);
      this.layouts(key);
      return this;
    }
    return this.cache.layouts[key];
  }
  this.cache.layouts[key] = {content: str, data: data || {}};
  this._layouts.set(key, data, str);
  return this;
};


/**
 * ## .layouts
 *
 * Add an object of layouts to `cache.layouts`.
 *
 * @param {Arguments}
 * @return {Template} to enable chaining.
 * @chainable
 * @api public
 */

Template.prototype.layouts = function (/*object*/) {
  if (arguments.length === 0) {
    return this.cache.layouts;
  }

  var args = [].slice.call(arguments);
  _.extend.apply(_, [this.cache.layouts].concat(args));
  return this;
};


/**
 * ## .set
 *
 * Assign `value` to `key`.
 *
 * ```js
 * template.set(key, value);
 * ```
 *
 * {%= docs("set") %}
 *
 * @param {String} `key`
 * @param {*} `value`
 * @return {Template} for chaining
 * @api public
 */

Template.prototype.set = function set(key, value) {
  this.cache[key] = value;
  return this;
};


/**
 * ## .get
 *
 * Return the stored value of `key`.
 *
 * ```js
 * template.set('foo', 'bar');
 * template.get('foo');
 * // => "bar"
 * ```
 *
 * @param {*} `key`
 * @return {*}
 * @api public
 */

Template.prototype.get = function (key) {
  return this.cache[key];
};

/**
 * ## .engine
 *
 * Register the given view engine callback `fn` as `ext`.
 *
 *
 * @param {String} `ext`
 * @param {Function|Object} `fn` or `options`
 * @param {Object} `options`
 * @return {Template} for chaining
 * @api public
 */

Template.prototype.engine = function (ext, fn, options) {
  var engine = {};

  if (typeof fn === 'function') {
    engine.renderFile = fn;
    engine.render = fn.render;
  } else if (typeof fn === 'object') {
    engine = fn;
    engine.renderFile = fn.renderFile || fn.__express;
  }
  engine.options = fn.options || options;

  if (typeof engine.render !== 'function') {
    throw new gutil.PluginError('Template', 'Engines are expected to have a `render` method.');
  }

  if ('.' !== ext[0]) {
    ext = '.' + ext;
  }
  this.engines[ext] = engine;
  return this;
};


/**
 * ## .compile
 *
 * Compile a template string.
 *
 * **Example:**
 *
 * ```js
 * template.compile('<%= foo %>');
 * ```
 *
 * @param  {String} `str` The actual template string.
 * @param  {String} `settings` Delimiters to pass to Lo-dash.
 * @return {String}
 * @api public
 */

Template.prototype.compile = function (str, options) {
  var settings = _.extend({}, this.options, options);
  return this.engine(str, null, settings);
};


/**
 * ## .render
 *
 * Render a template `str` with the given `context` and `options`.
 *
 * @param  {Object} `context` Data to pass to registered view engines.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.render = function (str, context, settings) {
  return this.engine(str, context, _.extend({
    imports: this.cache.tags
  }, settings));
};


/**
 * ## ._assertDelims
 *
 * Return `true` if template delimiters exist in `str`.
 *
 * @param  {String} `str`
 * @return {Boolean}
 * @api private
 */

Template.prototype._assertDelims = function (str, re) {
  return re ? str.indexOf(re.delims[0]) !== -1 &&
    str.indexOf(re.delims[1]) !== -1 :
    str.indexOf('<%') !== -1 ||
    str.indexOf('${') !== -1;
};


/**
 * ## .process
 *
 * Process a template `str` with the given `context` and `settings`.
 *
 * @param  {String} `str`
 * @param  {Object} `context`
 * @return {String}
 * @api public
 */

Template.prototype.process = function (str, context, settings) {
  var ctx = _.extend({}, this.context, context);
  var delims = this.getDelims(ctx.delims || settings);
  var original = str, layout, data = {};

  if (!ctx.layout) {
    data = _.extend({}, ctx);
  } else {
    layout = this._layouts.inject(str, ctx.layout);
    data = _.extend({}, ctx, layout.data);
    str = layout.content;
  }

  while (this._assertDelims(str, delims)) {
    str = this.render(str, data, delims);
    if (str === original) {
      break;
    }
  }
  return str;
};


module.exports = Template;