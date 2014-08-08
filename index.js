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
var debug = require('debug')('view-cache');
var Layouts = require('layouts');
var Cache = require('config-cache');
var Delimiters = require('delims');
var delimiters = new Delimiters();

var yellow = chalk.yellow;
var green = chalk.green;
var bold = chalk.bold;


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
  var opts = options || {};
  this.extend(opts);
  this.data(opts);
  this.defaultConfig(opts);
}

util.inherits(Template, Cache);


/**
 * Initialize default configuration.
 *
 * @api private
 */

Template.prototype.defaultConfig = function(opts) {
  this.context = {};

  this.set('locals', opts.locals || {});
  this.set('imports', opts.imports || {});

  this.option('cwd', opts.cwd || process.cwd());

  this.set('templates', opts.templates || {});
  this.option('delims', opts.delims || {});

  this.option('layout', opts.layout);
  this.option('layoutTag', opts.layoutTag || 'body');
  this.option('layoutDelims', opts.layoutDelims || ['{{', '}}']);
  this.option('partialLayout', opts.partialLayout);

  this.set('layouts', opts.layouts || {});
  this.set('partials', opts.partials || {});
  this.set('pages', opts.pages || {});

  this.set('helpers', opts.helpers || {});
  this.set('parsers', opts.parsers || {});

  this.set('engines', this.cache.engines || {});
  this.set('view engine', 'noop');
  this.enable('bindHelpers');

  this.addDelims('default', ['<%', '%>']);
  this.addDelims('es6', ['${', '}'], {
    interpolate: /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g
  });

  this._defaultEngines();
  this._defaultHelpers();
};


/**
 * ## ._defaultEngines
 *
 * Load default engines
 *
 * @api private
 */

Template.prototype._defaultEngines = function() {
  this.engine('lodash', require('./engines/lodash'));
  this.engine('default', require('./engines/default'));
};


/**
 * ## ._defaultHelpers
 *
 * Load default helpers onto the cache.
 *
 * @api private
 */

Template.prototype._defaultHelpers = function (options) {
  var self = this;

  /**
   * Partial helper
   *
   * @param  {String} `name`
   * @param  {Object} `locals`
   * @return {String}
   */

  this.addHelper('partial', function (name, locals, settings) {
    debug('[%s] partial: %s', green('helper'), bold(name));
    var ctx = _.extend({}, this, locals);
    var data = self._mergeContext(name, ctx);
    return self.render(name, data, settings);
  });
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

Template.prototype.getOne = function (type, key) {
  if (arguments.length === 1 && typeof key === 'string') {
    return this.cache[type][key];
  }
};


/**
 * ## .lazyLayouts
 *
 * Lazily add a `Layout` instance if it has not yet been added.
 * Also normalizes settings to pass to the `layouts` library.
 *
 * We can't instantiate `Layout` in the defaultConfig because
 * it reads settings which might not be set until after init.
 *
 * @api private
 */

Template.prototype.lazyLayouts = function(options) {
  if (!this.layoutCache) {
    var opts = _.extend({}, this.options, options);

    this.layoutCache = new Layouts({
      locals: opts.locals,
      layouts: opts.layouts,
      delims: opts.layoutDelims,
      tag: opts.layoutTag
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
  delims = delimiters.templates(delims, opts);
  return _.extend(delims, options);
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
 * template.process('{%= name %}<%= name %>', {name: 'Jon'});
 * //=> 'Jon<%= name %>'
 *
 * template.setDelims('angle');
 * template.process('{%= name %}<%= name %>', {name: 'Jon'});
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
  if (str && !(options && options.parsed)) {
    debug('[parse]: %s', bold(str.substring(0, 150)));

    var file = matter(str, _.defaults({
      autodetect: true
    }, options));

    file.content = file.content.replace(/^\s*/, '');
    file.parsed = true;

    return file;
  }
  return str;
};


/**
 * ## .parser
 *
 * Register a parser `fn` to be used on each `.src` file. This is used to parse
 * front matter, but can be used for any kind of parsing.
 *
 * @param {String} `name` Optional name of the parser, for debugging.
 * @param {Object} `options` Options to pass to parser.
 * @param {Function} `fn` The parsing function.
 * @return {Template} for chaining
 * @api public
 */

Template.prototype.addParser = function (ext, stage, fn) {
  if (ext[0] === '.') {
    ext = ext.replace(/^\./, '');
  }
  if (typeof stage === 'function') {
    fn = stage;
    stage = 'before';
  }

  var parsers = this.cache.parsers[ext] || [];
  fn = arrayify(fn).map(function(parser) {
    if (typeof parser !== 'function') {
      throw new TypeError('Template.parser() exception:', ext);
    }
    return parser;
  }.bind(this));

  this.cache.parsers[ext] = _.union([], parsers, fn);
  return this;
};


/**
 * ## .parse
 *
 * Traverse the `parser` stack, passing the `file` object to each
 * parser and returning the accumlated result.
 *
 * @param  {Object} `options`
 * @api private
 */

Template.prototype._parse = function (filepath, options) {
  var opts = _.extend({}, options);
  var ext = opts.ext || path.extname(filepath);

  if (ext[0] === '.') {
    ext = ext.replace(/^\./, '');
  }
  var parsers = this.cache.parsers[ext];
  if (ext === '.*') {
    parsers = [this.defaultParser];
  }

  // if (parsers && parsers.length) {
  //   parsers.forEach(function (parser) {
  //     try {
  //       file = parser(str, options);
  //     } catch (err) {
  //       throw new Error('Template._parse() parsing error:', err));
  //     }
  //   });
  // }
};


/**
 * ## .engine
 *
 * Register the given view engine callback `fn` as `ext`.
 *
 * {%= docs("api-engine") %}
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

  engine.options = fn.options || options || {};

  if (typeof engine.render !== 'function') {
    throw new Error('Template', 'Engines are expected to have a `render` method.');
  }

  if (ext[0] !== '.') {
    ext = '.' + ext;
  }
  this.cache.engines[ext] = engine;
  return this;
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
  var locals = _.extend({}, options);
  var opts = _.extend({}, this.options, options);

  this.lazyLayouts(opts);
  var o = {};

  glob.sync(patterns, opts).forEach(function (filepath) {
    debug('loading %s', chalk.magenta(filepath));

    var name = path.basename(filepath, path.extname(filepath));
    var str = fs.readFileSync(filepath, 'utf8');
    if (options && options.requireable) {
      if (this.option('bindHelpers')) {
        o[name] = _.bind(require(path.resolve(filepath)), this);
      } else {
        o[name] = require(path.resolve(filepath));
      }
    } else {
      if (!o.parsed) {
        o[name] = this.parse(str);
      }
      if (locals[name]) {
        o[name].data = _.extend({}, locals[name], o[name].data);
      } else {
        o[name].data = _.extend({}, locals, o[name].data);
      }
    }
  }.bind(this));

  this.data(o);
  return o;
};


/**
 * ## .normalize
 *
 * Read a glob of files, parse them and return objects.
 *
 * @param  {String} `patterns` Glob patterns to use.
 * @param  {Object} `options` Options to pass to [globby].
 * @api public
 */

Template.prototype.normalize = function (name, str, locals) {
  var ctx = _.extend({}, locals);
  var o = {};

  o[name] = {};
  o[name].locals = ctx;
  o[name].data = {};

  if (!ctx.parsed) {
    var parsed = this.parse(str);
    o[name] = _.extend({}, o[name], parsed);
  }

  // If a property on the context matches the name of
  // the template, extend the data object with that data.
  _.extend(o[name].data, this._mergeContext(name, {}));
  _.extend(o[name].data, ctx);

  o[name].layout = o[name].data.layout;
  delete o[name].data.layout;

  this.data(o);
  return o;
};


/**
 * ## ._mergeContext
 *
 * Correctly merge the context based on where the
 * data was defined.
 *
 * @param  {String} `key` The name of the data object to extend.
 * @param  {Object} `obj` Pass an object to extend wherever the method is used.
 * @param  {String} `type` The type of context being passed in.
 * @api public
 */

Template.prototype._mergeContext = function (key, obj, type) {
  if (this.cache.data[key] && this.cache.data[key].data) {
    var data = this.cache.data[key].data;
    obj = _.extend({}, data, obj);
  }
  return obj;
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
  debug('registering partials %s:', chalk.magenta(key));
  this.getOne('partials', key);

  var partials = this.normalize(key, str, locals);
  this.extend('partials', partials);
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

Template.prototype.partials = function (glob, locals) {
  debug('registering partials %s:', chalk.magenta(glob));
  this.extend('partials', this.load(glob, locals));
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
  debug('registering pages %s:', chalk.magenta(key));
  this.getOne('pages', key);

  this.extend('pages', this.normalize(key, str, locals));
  return this;
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

Template.prototype.pages = function (glob, locals) {
  debug('registering pages %s:', chalk.magenta(glob));
  this.extend('pages', this.load(glob, locals));
  return this;
};


/**
 * ## .addLayout
 *
 * Proxy for `layoutCache.setLayout`.
 *
 * @api private
 */

Template.prototype.addLayout = function(obj) {
  this.lazyLayouts();
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
  debug('registering layouts %s:', chalk.magenta(key));
  this.getOne('layouts', key);

  var layouts = this.normalize(key, str, locals);
  this.extend('layouts', layouts);
  this.addLayout(layouts);
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

Template.prototype.layouts = function (glob, locals) {
  debug('registering layouts %s:', chalk.magenta(glob));
  var layout = this.load(glob, locals);
  this.extend('layouts', layout);
  this.addLayout(layout);
  return this;
};


/**
 * Build a layout based on a template's current context.
 *
 * @param  {String} `content` The template string.
 * @param  {String} `layout` The layout name.
 * @param  {Object} `locals` Context.
 * @return {Object}
 */

Template.prototype.buildLayout = function (content, layout, locals) {
  debug('[building] layout: %s', bold(layout));

  return this.layoutCache.inject(content, layout, {
    locals: locals,
    delims: this.option('layoutDelims'),
    tag: this.option('layoutTag')
  });
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
  if (this.option('bindHelpers')) {
    this.cache.helpers[key] = _.bind(value, this);
  } else {
    this.cache.helpers[key] = value;
  }
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
  debug('registering helpers %s:', chalk.magenta(pattern));
  var opts = _.extend({requireable: true}, options);
  this.extend('helpers', this.load(pattern, opts));
  return this;
};


/**
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
  return this.process(str, null, settings);
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
  return this.compile(fs.readFileSync(filepath, 'utf8'), settings);
};


/**
 * ## .renderFile
 *
 * Render a template from a filepath with the
 * given `locals` and `settings`.
 *
 * @param  {Object} `locals` Data to pass to registered view engines.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.renderFile = function (filepath, locals, settings) {
  var name = path.basename(filepath, path.extname(filepath));
  var str = fs.readFileSync(filepath, 'utf8');
  this.page(name, str, locals);
  return this.render(name, locals, settings);
};


/**
 * Render a template `str` with the given
 * `locals` and `settings`.
 *
 * @param  {Object} `locals` Data to pass to registered view engines.
 * @param  {Object} `options` Options to pass to registered view engines.
 * @return {String}
 * @api public
 */

Template.prototype.render = function (name, locals, settings) {
  var tmpl = this.cache.pages[name] || this.cache.partials[name];
  var data = (this.cache.data[name] && this.cache.data[name].data) || {};
  var ctx = _.defaults({layout: tmpl.layout, parsed: true}, data, tmpl.data, locals);
  return this.process(tmpl.content, ctx, settings);
};


/**
 * Process a template `str` with the given
 * `locals` and `settings`.
 *
 * @param  {String} `str` The template string.
 * @param  {Object} `locals` Optionally pass locals to use as context.
 * @param  {Object} `settings` Optionally pass the template delimiters to use.
 * @return {String}
 * @api public
 */

Template.prototype.process = function (str, locals, settings) {
  debug('[rendering] template: %s', bold(str.substring(0, 150)));
  settings = _.extend({}, settings);
  locals = _.extend({}, locals);

  this.lazyLayouts();

  var tmpl = {};
  if (!locals.parsed) {
    tmpl = this.parse(str);
  }
  locals = _.extend({}, locals);
  var context = {};

  _.extend(context, this.cache.data);
  _.extend(context, locals);
  _.extend(context, tmpl.data);

  var delims = this.getDelims(settings.delims || context.delims);

  var ext = context.ext || settings.ext || this.get('view engine');
  if (ext[0] !== '.') {
    ext = '.' + ext;
  }

  var engine = this.get(['engines', ext]);
  if (!engine) {
    engine = this.cache.engines['.default'];
  }

  var currentLayout = tmpl.layout || locals.layout;
  var original = str;
  var layout;

  if (currentLayout) {
    debug('[building] layout: %s', bold(context.layout));
    layout = this.layoutCache.inject(tmpl.content, currentLayout, {
      locals: locals,
      delims: this.get('layoutDelims'),
      tag: this.get('layoutTag')
    });

    debug('[flattened] %j', yellow(layout));
    context = _.extend({}, context, layout.locals);
  }

  str = (layout && layout.content) || tmpl.content;

  settings = _.extend({helpers: this.cache.helpers}, delims);

  while (this.assertDelims(str, delims)) {
    str = engine.render(str, context, settings);
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