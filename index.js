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
var matter = require('gray-matter');
var debug = require('debug')('template');
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
  this.cache.delims = {};

  this.options = _.extend({}, options);
  this.data(this.options.locals || {});
  this.defaultConfig(this.options);
}

util.inherits(Template, Cache);


/**
 * Initialize default configuration.
 *
 * @api private
 */

Template.prototype.defaultConfig = function(opts) {
  this.set('cwd', opts.cwd || process.cwd());

  this.set('layout', opts.layout);
  this.set('locals', opts.locals || {});

  this.set('templates', opts.templates || {});
  this.set('partials', opts.partials || {});
  this.set('layouts', opts.layouts || {});
  this.set('helpers', opts.helpers || {});
  this.set('delims', opts.delims || {});

  this.addDelims('default', ['<%', '%>']);
  this.addDelims('es6', ['${', '}'], {
    interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
  });

  this.defaultHelpers();
};


/**
 * ## .lazyLayouts
 *
 * Lazily add a `Layout` instance if it has not yet been added.
 * Also normalizes settings to pass to the `layouts` library.
 *
 * We cannot instantiate `Layout` in the defaultConfig because
 * it reads settings which might be set until after init.
 *
 * @api private
 */

Template.prototype.lazyLayouts = function(options) {
  if (!this.layoutCache) {
    var opts = _.defaults({}, options, this.options);
    var settings = {};

    settings.cache = opts.layouts;
    settings.delims = opts.layoutDelims;
    settings.tag = opts.layoutTag;
    this.layoutCache = new Layouts(settings);
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

Template.prototype.makeDelims = function (delims, options) {
  return _.extend(delimiters.templates(delims, _.defaults({
    escape: true
  }, options)), options);
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
 * @param {Array} `delims` Array of delimiter strings. See [delims] for details.
 * @param {Object} `opts` Options to pass to [delims].
 * @api public
 */

Template.prototype.addDelims = function (name, delims, opts) {
  this.cache.delims[name] = _.extend({}, this.makeDelims(delims, opts), opts);
  debug('adding delimiters: `' + name + '` %j', delims);
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
  if(this.cache.delims.hasOwnProperty(name)) {
    return this.cache.delims[name];
  }
  name = this.currentDelims || 'default';
  return this.cache.delims[name];
};


/**
 * ## .addHelper
 *
 * Add a custom template helper.
 *
 * **Example:**
 *
 * ```js
 * template.addHelper('include', function(filepath) {
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

Template.prototype.addHelper = function (key, value) {
  debug('register helper %s', key);

  this.cache.helpers[key] = value;
  return this;
};


/**
 * ## .defaultHelpers
 *
 * Add default helpers to the cache.
 *
 * @api private
 */

Template.prototype.defaultHelpers = function () {
  this.addHelper('partial', function (name) {
    debug('loading partial %s', name);

    return this.cache.partials[name];
  }.bind(this));
};


/**
 * ## .fileObject
 *
 * Normalize a template to a file object.
 *
 * @param  {String} `key`
 * @param  {Object} `value`
 * @return {Template} to enable chaining.
 * @chainable
 * @api public
 */

Template.prototype.fileObject = function (key, str) {
  if (!str) {
    if (typeof key === 'object') {
      this.partials(key);
      return this;
    }
    return this.cache.partials[key];
  }
  debug('adding partial %s', key);
  this.cache.partials[key] = str;
  return this;
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

Template.prototype.partial = function (key, str) {
  if (!str) {
    if (typeof key === 'object') {
      this.partials(key);
      return this;
    }
    return this.cache.partials[key];
  }
  debug('adding partial %s', key);
  this.cache.partials[key] = str;
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

Template.prototype.partials = function (obj) {
  if (arguments.length === 0) {
    return this.cache.partials;
  }
  _.forIn(obj, function (value, key) {
    debug('adding partial %s', key);
    this.extend('partials.' + key, value);
  }.bind(this));
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

Template.prototype.layout = function (key, str, locals) {
  this.lazyLayouts();

  if (arguments.length === 1) {
    if (typeof key === 'object') {
      this.layoutCache.set(key);
      this.layouts(key);
      return this;
    }
    return this.cache.layouts[key];
  }
  debug('adding layout %s', key);
  this.layoutCache.set(key, locals, str);
  this.cache.layouts[key] = {
    locals: locals,
    content: str
  };
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

Template.prototype.layouts = function (obj) {
  this.lazyLayouts();

  if (arguments.length === 0) {
    return this.cache.layouts;
  }
  _.forIn(obj, function (value, key) {
    debug('adding layout %s', key);
    this.cache.layouts[key] = this.cache.layouts[key] || {};
    if (typeof value === 'string') {
      this.cache.layouts[key] = {
        content: value
      };
    } else {
      this.cache.layouts[key] = value;
    }
  }.bind(this));
  this.layoutCache.set(this.cache.layouts);
  return this;
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

Template.prototype.parse = function (str, options) {
  return matter(str, _.extend({autodetect: true}, options));
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
  return this.render(fs.readFileSync(filepath, 'utf8'), locals, settings);
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
  return _.template(str, locals, settings);
};


/**
 * ## .render
 *
 * Process a template `str` with the given `locals` and `settings`.
 *
 * @param  {String} `str` The template string.
 * @param  {Object} `locals` Optionally pass locals to use as context.
 * @param  {Object} `settings` Optionally pass the template delimiters to use.
 * @return {String}
 * @api public
 */

Template.prototype.process = function (str, locals, settings) {
  var opts = _.extend({}, this.options);
  settings = settings || {};

  var tmpl = this.parse(str);
  this.lazyLayouts(opts);

  var ctx = this.cache.data;
  this.extendData(opts);
  this.extendData(locals);
  this.extendData(tmpl.data);

  var delims = this.getDelims(settings.delims || ctx.delims);
  var original = str;
  var layout;

  if (ctx.layout || this.get('layout')) {
    debug('building layout: %s', ctx.layout);

    var currentLayout = ctx.layout || this.get('layout');
    layout = this.layoutCache.inject(str, currentLayout, {
      locals: ctx,
      delims: opts.layoutDelims,
      tag: opts.layoutTag
    });

    debug('layout %j', layout);

    this.extendData(layout.locals);
    str = layout.content || str;
  }

  settings = _.extend({imports: this.cache.helpers}, delims);
  while (this.assertDelims(str, delims)) {
    str = this.render(str, ctx, settings);
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