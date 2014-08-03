/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var _ = require('lodash');
var fs = require('fs');
var util = require('util');
var debug = require('debug')('template');
var lookup = require('lookup-path');
var Layouts = require('layouts');
var Cache = require('config-cache');
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

function Template(options) {
  Cache.call(this, options);
  var opts = _.extend({}, options);

  this.locals = opts.locals || {};
  this.delims = opts.delims || {};

  this.defaultConfig(opts);
  this.options = opts;
}
util.inherits(Template, Cache);


/**
 * Initialize default configuration.
 *
 * @api private
 */

Template.prototype.defaultConfig = function(opts) {
  this.set('cwd', opts.cwd || process.cwd());

  this.cache.templates = {};
  this.set('tags', opts.tags || {});
  this.set('layouts', opts.layouts || {});
  this.set('partials', opts.partials || {});

  this.addDelims('default', ['<%', '%>']);
  this.addDelims('es6', ['${', '}'], {
    interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
  });

  this.defaultTags();
};


/**
 * ## .lazyLayouts
 *
 * lazily add a `Layout` instance if it has not yet been added.
 *
 * We cannot instantiate `Layout` in the defaultConfig because
 * it reads settings which might be set until after init.
 *
 * @api private
 */

Template.prototype.lazyLayouts = function(options) {
  if (!this.layoutCache) {
    var opts = _.defaults({}, options, this.options);
    opts.delims = opts.layoutDelims;
    opts.tag = opts.layoutTag;
    this.layoutCache = new Layouts(opts);
  }
};


/**
 * ## .makeDelims
 *
 * Pass custom delimiters to Lo-Dash.
 *
 * **Example:**
 *
 * ```js
 * template.makeDelims(['{%', '%}'], ['{{', '}}'], opts);
 * ```
 *
 * @param  {Array} `delims` Array of delimiters.
 * @param  {Array} `layoutDelims` layout-specific delimiters to use. Default is `['{{', '}}']`.
 * @param  {Object} `options` Options to pass to [delims].
 * @api private
 */

Template.prototype.makeDelims = function (delims, layoutDelims, options) {
  return delimiters.templates(delims, _.defaults({
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
  var delims = this.makeDelims(delimiterArray, options);
  this.set('delims.' + name, _.extend({}, delims, options));
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
 * ## .defaultTags
 *
 * Add default tags to the cache.
 *
 * @api private
 */

Template.prototype.defaultTags = function () {
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

Template.prototype.partials = function () {
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
  this.lazyLayouts();

  if (arguments.length === 1) {
    if (typeof key === 'object') {
      this.layoutCache.set(key);
      this.layouts(key);
      return this;
    }
    return this.cache.layouts[key];
  }
  this.cache.layouts[key] = {content: str, data: data || {}};
  this.layoutCache.set(key, data, str);
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

Template.prototype.layouts = function () {
  this.lazyLayouts();

  if (arguments.length === 0) {
    return this.cache.layouts;
  }

  var args = [].slice.call(arguments);
  _.extend.apply(_, [this.cache.layouts].concat(args));
  this.layoutCache.set(this.cache.layouts);
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

Template.prototype.compile = function (str, settings) {
  this.lazyLayouts(settings);

  return _.template(str, null, _.extend(this.options, {
    imports: this.cache.tags
  }, settings));
};


/**
 * ## .compileFile
 *
 * Compile a template from a filepath.
 *
 * **Example:**
 *
 * ```js
 * template.compileFile('templates/index.tmpl');
 * ```
 *
 * @param  {String} `filepath`
 * @param  {Object} `options`
 * @return {String}
 * @api public
 */

Template.prototype.compileFile = function (filepath, settings) {
  var str = fs.readFileSync(filepath, 'utf8');
  return this.compile(str, settings)
};


/**
 * ## .render
 *
 * Render a template `str` with the given `locals` and `options`.
 *
 * @param  {Object} `locals` Data to pass to registered view engines.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.render = function (str, locals, settings) {
  return this.compile(str, settings)(locals);
};


/**
 * ## .renderFile
 *
 * Render a template `str` with the given `locals` and `options`.
 *
 * @param  {Object} `locals` Data to pass to registered view engines.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.renderFile = function (filepath, locals, settings) {
  return this.compileFile(filepath, settings)(locals);
};


/**
 * ## .assertDelims
 *
 * Return `true` if template delimiters exist in `str`.
 *
 * @param  {String} `str`
 * @return {Boolean}
 * @api private
 */

Template.prototype.assertDelims = function (str, re) {
  return re ? str.indexOf(re.delims[0]) !== -1 &&
    str.indexOf(re.delims[1]) !== -1 :
    str.indexOf('<%') !== -1 ||
    str.indexOf('${') !== -1;
};


/**
 * ## .process
 *
 * Process a template `str` with the given `locals` and `settings`.
 *
 * @param  {String} `str`
 * @param  {Object} `locals`
 * @return {String}
 * @api public
 */

Template.prototype.process = function (str, locals, options) {
  var ctx = _.extend({}, this.locals, locals);
  var opts = _.extend({}, this.options, options);
  this.lazyLayouts(opts);

  var delims = this.getDelims(ctx.delims || opts.delims);
  var original = str, layout, data = {};

  debug('delimiters:', delims)

  if (!ctx.layout) {
    data = _.extend({}, ctx);
  } else {
    layout = this.layoutCache.inject(str, ctx.layout, {
      delims: opts.layoutDelims,
      tag: opts.layoutTag
    });
    data = _.extend({}, ctx, layout.data);
    str = layout.content;
  }

  while (this.assertDelims(str, delims)) {
    str = this.render(str, data, delims);
    if (str === original) {
      break;
    }
  }
  return str;
};


/**
 * Expose `Template`
 */

module.exports = Template;