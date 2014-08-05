/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var util = require('util');
var chalk = require('chalk');
var glob = require('globby');
var arrayify = require('arrayify-compact');
var matter = require('gray-matter');
var debug = require('debug')('template');
var Layouts = require('layouts');
var Cache = require('config-cache');
var Delimiters = require('delims');
var delimiters = new Delimiters();

var yellow = chalk.yellow;
var green = chalk.green;
var bold = chalk.bold;
var gray = chalk.gray;
var cyan = chalk.cyan;


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
  this.extend(options);
  this.defaultConfig();
}

util.inherits(Template, Cache);


/**
 * Initialize default configuration.
 *
 * @api private
 */

Template.prototype.defaultConfig = function() {
  this.set('cwd', this.cache.cwd || process.cwd());

  this.set('templates', this.cache.templates || {});
  this.set('delims', this.cache.delims || {});

  this.set('layout', this.cache.layout);
  this.set('layoutDelims', this.cache.layoutDelims || ['{{', '}}']);
  this.set('layoutTag', this.cache.layoutTag || 'body');

  this.set('pages', this.cache.pages || {});
  this.set('partials', this.cache.partials || {});
  this.set('layouts', this.cache.layouts || {});
  this.set('locals', this.cache.locals || {});

  this.set('parsers', this.cache.parsers || {});
  this.set('helpers', this.cache.helpers || {});

  this.addDelims('default', ['<%', '%>']);
  this.addDelims('es6', ['${', '}'], {
    interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
  });

  this._defaultHelpers();
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
    var opts = _.extend({}, options);

    this.layoutCache = new Layouts({
      locals: opts.locals,
      layouts: opts.layouts || this.get('layouts'),
      delims: opts.layoutDelims || this.get('layoutDelims'),
      tag: opts.layoutTag || this.get('layoutTag')
    });
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
  var opts = _.defaults({escape: true}, options);
  return _.extend(delimiters.templates(delims, opts), options);
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
  debug('adding delimiters %s: %j', chalk.magenta(name), delims);

  var settings = _.defaults({}, opts, this.makeDelims(delims, opts));
  this.extend('delims.' + name, settings);
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
 * ## .load
 *
 * Read a glob of files, parse them and return objects.
 *
 * @param  {String} `patterns` Glob patterns to use.
 * @param  {Object} `options` Options to pass to [globby].
 * @api public
 */

Template.prototype.load = function (patterns, options) {
  var obj = {};

  glob.sync(patterns, options).forEach(function (filepath) {
    debug('loading %s', chalk.magenta(filepath));

    var name = path.basename(filepath, path.extname(filepath));
    var str = fs.readFileSync(filepath, 'utf8');
    if (options && options.require) {
      obj[name] = require(path.resolve(filepath));
    } else {
      obj[name] = this.parse(str);
    }
  }.bind(this));

  return obj;
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
  debug('register helper %s', chalk.magenta(key));

  this.cache.helpers[key] = value;
  return this;
};


/**
 * ## .addHelpers
 *
 * Add an array or glob of template helpers. When this
 * method is used, each helper's name is derived from
 * the basename the file.
 *
 * **Example:**
 *
 * ```js
 * template.addHelpers('helpers/*.js');
 * ```
 *
 * @param  {String} `key`
 * @param  {Object} `value`
 * @return {Template} to enable chaining.
 * @chainable
 * @api public
 */

Template.prototype.addHelpers = function (pattern, options) {
  debug('registering helpers %s:', chalk.magenta(patterns));

  var opts = _.extend({require: true}, options);
  this.extend('helpers', this.load(pattern, opts));
  return this;
};


/**
 * ## ._defaultHelpers
 *
 * Load default helpers onto the cache.
 *
 * @api private
 */

Template.prototype._defaultHelpers = function () {
  this.addHelper('partial', function (name, locals) {
    debug('%s [loading] partial %s:', green('helper'), bold(name));

    var partial = this.cache.partials[name];
    if (partial) {
      var ctx = _.extend({}, partial.data, locals);
      return this.process(partial.content, ctx);
    }
  }.bind(this));
};


/**
 * ## .loadTemplate
 *
 * Add an object of loadTemplate to `cache[name]`.
 *
 * @param {Arguments}
 * @return {Template} to enable chaining.
 * @chainable
 * @api public
 */

Template.prototype.loadTemplate = function (name, isLayout) {
  this.lazyLayouts();
  var self = this;

  this.cache[name] = this.cache[name] || {};

  return function (key, str, locals) {
    var args = [].slice.call(arguments).filter(Boolean);
    var arity = args.length;

    if (arity === 1) {
      if (typeof key === 'object') {
        debug('[adding] %ss: %j', gray(name), Object.keys(key));
        key.locals = locals || {};
        if (isLayout) {
          self.setLayout(key);
        } else {
          locals.layout = locals.layout || global.layout;
        }
        self.extend(name, key);
        return self;
      }
      return self.cache[name][key];
    }

    debug('[adding] %s: %s', gray(name), key);

    if (typeof key === 'string' && typeof str === 'string') {
      self.cache[name][key] = self.parse(str);
    } else {
      self.cache[name][key] = str;
    }

    self.cache[name][key].data = locals || {};
    self.cache[name][key].layout = (locals && locals.layout);
    delete self.cache[name][key].data.layout;

    if (isLayout) {
      self.setLayout(self.cache.layouts);
    }
  };

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

Template.prototype.loadTemplates = function (name, isLayout, patterns, options) {
  var opts = _.extend({}, options);
  this.lazyLayouts();

  this.cache[name] = this.cache[name] || {};

  if (arguments.length > 0) {
    try {
      var isGlob = (typeof patterns === 'string' || Array.isArray(patterns));
      if (isGlob) {
        debug('[loading] %s: %s', gray(name), patterns);
        patterns = this.load(patterns, opts);
      }

      var isObject = (typeof patterns === 'object' && !Array.isArray(patterns));
      if (isObject) {
        debug('[registering] %s object: %j', gray(name), patterns);

        _.forIn(patterns, function (value, key) {
          if (value && typeof value === 'string') {
            value = this.parse(value);
          }
          this.cache[name][key] = value;
          if (isLayout) {
            this.setLayout(this.cache[name][key]);
          }
        }.bind(this));
        return this;
      }
    } catch (err) {
      throw new Error('loadTemplates', err);
    }
  }

  return this.cache[name];
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

Template.prototype.partial = function (key, str, locals) {
  if (arguments.length === 1 && typeof key === 'string') {
    return this.cache.partials[key];
  }
  this.loadTemplate('partials', false)(key, str, locals);
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

Template.prototype.partials = function (patterns, options) {
  this.loadTemplates('partials', false, patterns, options);
  return this;
};


/**
 * ## .page
 *
 * Add a page to `cache.pages`.
 *
 * @param  {String} `key`
 * @param  {Object} `value`
 * @return {Template} to enable chaining.
 * @chainable
 * @api public
 */

Template.prototype.page = function (key, str, locals) {
  if (arguments.length === 1 && typeof key === 'string') {
    return this.cache.pages[key];
  }
  this.loadTemplate('pages', false)(key, str, locals);
};


/**
 * ## .pages
 *
 * Add an object of pages to `cache.pages`.
 *
 * @param {Arguments}
 * @return {Template} to enable chaining.
 * @chainable
 * @api public
 */

Template.prototype.pages = function (patterns, options) {
  this.loadTemplates('pages', false, patterns, options);
  return this;
};


/**
 * ## .setLayout
 *
 * Proxy for `layoutCache.setLayout`.
 *
 * @api private
 */

Template.prototype.setLayout = function(obj) {
  this.layoutCache.setLayout(obj);
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
  if (arguments.length === 1 && typeof key === 'string') {
    return this.cache.layouts[key];
  }
  this.loadTemplate('layouts', true)(key, str, locals);
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

Template.prototype.layouts = function (patterns, options) {
  this.loadTemplates('layouts', true, patterns, options);
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

Template.prototype.processFile = function (filepath, locals, settings) {
  return this.process(fs.readFileSync(filepath, 'utf8'), locals, settings);
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

Template.prototype.process = function (str, locals, settings) {
  return this.render(str, locals, settings);
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

Template.prototype.render = function (str, locals, settings) {
  debug('[rendering] template: %s', bold(str.substring(0, 150)));
  this.lazyLayouts();

  var tmpl = this.parse(str);
  locals = _.extend({}, locals);
  var data = {};

  _.extend(data, this.cache.locals);
  _.extend(data, this.cache.data);
  _.extend(data, locals);
  _.extend(data, tmpl.data);
  _.extend(this.cache.locals, data);

  settings = _.extend({}, settings);
  var delims = this.getDelims(settings.delims || data.delims);

  var currentLayout = tmpl.layout || locals.layout;
  var original = str;
  var layout;

  if (currentLayout) {
    debug('[building] layout: %s', bold(data.layout));
    layout = this.layoutCache.inject(tmpl.content, currentLayout, {
      locals: locals,
      delims: this.get('layoutDelims'),
      tag: this.get('layoutTag')
    });

    debug('[flattened] %j', yellow(layout));
    data = _.extend({}, data, layout.locals);
  }
  str = (layout && layout.content) || tmpl.content;

  settings = _.extend({imports: this.cache.helpers}, delims);
  while (this.assertDelims(str, delims)) {
    str = _.template(str, data, settings);
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