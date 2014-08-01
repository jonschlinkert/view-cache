/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var _ = require('lodash');
var path = require('path');
var glob = require('globby');
var Layouts = require('layouts');
var isAbsolute = require('is-absolute');
var Delimiters = require('delims');
var delimiters = new Delimiters();
var View = require('./view');


var noop = function (str) {
  return str;
};
noop.render = function (str) {
  return str;
};
noop.renderFile = function (str) {
  return str;
};


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
  var opts = _.extend({}, options);
  opts.cwd = opts.cwd || process.cwd();
  this.context = opts.locals || {};
  this.delims = opts.delims || {};
  this.cache = opts.cache || {};
  this.options = opts;

  this.defaultConfig(this.options);
}


/**
 * Initialize default configuration.
 *
 * @api private
 */

Template.prototype.defaultConfig = function(opts) {
  this.set('cwd', opts.cwd || process.cwd());
  this._engine = noop;

  this.cache.templates = {};
  this.engines = {};

  this.engine('tmpl', noop);
  this.set('tags', opts.tags || {});
  this.set('layouts', opts.layouts || {});
  this.set('partials', opts.partials || {});
  this.set('view engine', 'tmpl');

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
 * ## .extend
 *
 * Extend the `cache` with the given object. This method is chainable.
 *
 * **Example**
 *
 * ```js
 * cache
 *   .extend({foo: 'bar'}, {baz: 'quux'});
 *   .extend({fez: 'bang'});
 * ```
 *
 * @chainable
 * @method extend
 * @param {Arguments} Objects to extend on to the `cache`.
 * @return {Cache} for chaining
 * @api public
 */

Template.prototype.extend = function() {
  var args = [].slice.call(arguments);
  _.extend.apply(_, [this].concat(args));
  return this;
};

/**
 * Check if `setting` is enabled (truthy).
 *
 *    template.enabled('foo')
 *    // => false
 *
 *    template.enable('foo')
 *    template.enabled('foo')
 *    // => true
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */

Template.prototype.enabled = function(setting){
  return !!this.set(setting);
};

/**
 * Check if `setting` is disabled.
 *
 *    template.disabled('foo')
 *    // => true
 *
 *    template.enable('foo')
 *    template.disabled('foo')
 *    // => false
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */

Template.prototype.disabled = function(setting){
  return !this.set(setting);
};

/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @api public
 */

Template.prototype.enable = function(setting){
  return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @api public
 */

Template.prototype.disable = function(setting){
  return this.set(setting, false);
};



/**
 * ## .data
 *
 * Extend the `context` with the given object. This method is chainable.
 *
 * **Example**
 *
 * ```js
 * cache
 *   .data({foo: 'bar'}, {baz: 'quux'});
 *   .data({fez: 'bang'});
 * ```
 *
 * @chainable
 * @method data
 * @param {Arguments} Objects to extend on to the `context` object.
 * @return {Cache} for chaining
 * @api public
 */

Template.prototype.data = function() {
  var args = [].slice.call(arguments);
  _.extend.apply(_, [this.context].concat(args));
  return this;
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

Template.prototype.engine = function(ext, fn, options) {
  var engine = {};
  if (typeof fn === 'function') {
    engine = fn;
  } else if (typeof fn === 'object') {
    engine = fn;
    engine.renderFile = fn.renderFile || fn.__express;
    engine.render = fn.render;
  }
  engine.options = options || {};

  if (typeof engine.render !== 'function') {
    throw new Error('Engines are expected to have a `render` method.');
  }

  if (ext[0] !== '.') {
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

Template.prototype.compile = function (str, settings) {
  var opts = _.extend({}, this.options, settings);
  opts.ext = opts.ext || this.ext;
  this.lazyLayouts(settings);

  var view = new View(opts.filename, opts);

  return view.compile(str, opts);
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

Template.prototype.compileFile = function (filepath, options) {
  var opts = _.extend(this.options, options);
  this.lazyLayouts(opts);

  opts.ext = path.extname(filepath);
  opts.filename = filepath;

  var file = this.engines[opts.ext].renderFile(filepath, null, opts);
  return this.cache.templates[filepath] = file;
};


/**
 * ## .compileFiles
 *
 * Pass a filepath, array of filepaths or glob patterns and compile each file.
 *
 * **Example:**
 *
 * ```js
 * template.compileFiles('*.tmpl');
 * ```
 *
 * @param  {Array|String} `patterns` String or array of file paths or glob patterns.
 * @param  {Array} `options` Options to pass to globby
 * @return {Array}
 * @api public
 */

Template.prototype.compileFiles = function (patterns, options) {
  var opts = _.extend(this.options, options);

  if (typeof patterns === 'string' && isAbsolute(patterns)) {
    if (this.cache.templates.hasOwnProperty(patterns)) {
      return this.cache.templates[patterns];
    }
    return this.compileFile(patterns, opts);
  }

  glob.sync(patterns, opts).forEach(function (filepath) {
    filepath = path.resolve(opts.cwd, filepath);
    this.compileFile(filepath, options);
  }.bind(this));
  return this;
};


/**
 * ## .cache
 *
 * Pass a filepath, array of filepaths or glob patterns and cache each file.
 *
 * **Example:**
 *
 * ```js
 * template.cache('<%= foo %>', {delims: ['{%', '%}']});
 * ```
 *
 * @param  {Array|String} `patterns` File path(s) or glob patterns.
 * @param  {Array} `options`
 * @return {Array}
 * @api public
 */

Template.prototype.cacheView = function (patterns, options) {
  var opts = _.extend(this.options, options);
  if (typeof patterns === 'string' && isAbsolute(patterns)) {
    if (this.cache.templates.hasOwnProperty(patterns)) {
      return this.cache.templates[patterns];
    }
    return this.compileFile(patterns, this.options);
  }

  glob.sync(patterns, this.options).forEach(function(filepath) {
    filepath = path.resolve(this.options.cwd, filepath);
    this.cacheView(filepath, options);
  }.bind(this));
  return this;
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

Template.prototype.render = function (str, context, options) {
  this.lazyLayouts(options);
  var settings = _.extend({imports: this.cache.tags}, settings);
  return this.compile(str, settings)(context);
};


Template.prototype.renderFile = function (name, options) {
  options = options || {};
  this.lazyLayouts(options);

  var opts = {};
  var cache = this.cache.templates;
  var engines = this.engines;
  var view;

  _.extend(opts, this.locals);
  _.extend(opts, options);

    // set .cache unless explicitly provided
  opts.cache = opts.cache == null
    ? this.enabled('view cache')
    : opts.cache;

  // primed cache
  if (opts.cache) {
    view = cache[name];
  }

  if (!view) {
    view = new View(name, {
      defaultEngine: this.get('view engine'),
      cwd: this.get('cwd'),
      engines: engines,
      imports: this.cache.tags
    });

    if (!view.path) {
      var err = new Error('.render() could not find "' + name + '".');
      err.view = view;
      return err;
    }

    // prime the cache
    if (opts.cache) {
      cache[name] = view;
    }
  }

  try {
    return view.renderFile(opts);
    // console.log(view)
  } catch (err) {
    return err;
  }
};


/**
 * ## .renderFile
 *
 * Render a template `str` with the given `context` and `options`.
 *
 * @param  {Object} `context` Data to pass to registered view engines.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

// Template.prototype.renderFile = function (filepath, context, settings) {
//   var opts = _.extend({imports: this.cache.tags}, settings);
//   this.lazyLayouts(opts);

//   return this.compileFile(filepath, opts)(context);
// };


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
 * Process a template `str` with the given `context` and `settings`.
 *
 * @param  {String} `str`
 * @param  {Object} `context`
 * @return {String}
 * @api public
 */

Template.prototype.process = function (str, context, options) {
  var ctx = _.extend({}, this.context, context);
  var opts = _.extend({}, this.options, options);
  this.lazyLayouts(opts);

  var delims = this.getDelims(ctx.delims || opts.delims);
  var original = str, layout, data = {};

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