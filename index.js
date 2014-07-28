/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var _ = require('lodash');
var Layouts = require('layouts');


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

var Template = module.exports = function Template(context, options) {
  this.context = context || {};
  this.options = options || {};
  var opts = this.options;
  this.cache = {};

  this.constant('cwd', opts.cwd || process.cwd());
  this._cache('partials', opts.partials || {});
  this._cache('layouts', opts.layouts || {});
  this._cache('tags', opts.tags || {});

  this._layouts = new Layouts(opts);
  this.defaultTags();
};



Template.prototype._cache = function(key, value) {
  this.constant(key, value, this.cache);
};


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




Template.prototype.context = function (key, value) {
  this.cache.tags[key] = value;
};

Template.prototype.data = function (key, value) {
  this.cache.tags[key] = value;
};


/**
 * ## .addtag
 *
 * Add a partial to the tags cache (`cache.tags`).
 *
 * @param  {String} `key`
 * @param  {Object} `value`
 * @return {Template} to enable chaining.
 */

Template.prototype.addTag = function (key, value) {
  this.cache.tags[key] = value;
  return this;
};


/**
 * ## .defaultTags
 *
 * Initialize and add default tags to the cache.
 *
 * @api private
 */

Template.prototype.defaultTags = function () {
  this.addTag('partial', function (name) {
    return this.cache.partials[name];
  }.bind(this));

  this.addTag('layout', function (name) {
    return this.cache.partials[name];
  }.bind(this));
};


/**
 * ## .partial
 *
 * Add a partial to the partials cache (`cache.partials`).
 *
 * @param  {String} `key`
 * @param  {Object} `value`
 * @return {Template} to enable chaining.
 */

Template.prototype.partial = function (key, value) {
  this.cache.partials[key] = value;
  return this;
};

Template.prototype.partials = function (obj) {
  if (arguments.length === 0) {
    return this.cache.partials;
  }

  var args = [].slice.call(arguments);
  _.extend.apply(_, [this.cache.partials].concat(args));
  return this;
};


/**
 * Layouts
 */

Template.prototype.layout = function (key, str, data) {
  this.cache.layouts[key] = {content: str, data: data || {}};
  this._layouts.set(key, data, str);
  return this;
};


Template.prototype.layouts = function (obj) {
  if (arguments.length === 0) {
    return this.cache.layouts;
  }

  var args = [].slice.call(arguments);
  _.extend.apply(_, [this.cache.layouts].concat(args));
  // this._layouts.set(this.cache.layouts);
  return this;
};


/**
 * Get
 */

Template.prototype.get = function (key) {
  return this.cache.tags[key];
};



/**
 * Get
 */

Template.prototype.assertDelims = function (str) {
  return str.indexOf('${') >= 0 || str.indexOf('%>') >= 0;
};


/**
 * Process a template `str` with the given `context`.
 *
 * @param  {String} `str`
 * @param  {Object} `context`
 * @return {String}
 */

Template.prototype.process = function (str, context) {
  var ctx = _.extend({}, this.context, context);
  var layout = this._layouts.inject(str, ctx.layout);
  var data = _.extend({}, ctx, layout.data);
  var original = str;

  str = layout.content;
  while (this.assertDelims(str)) {
    str = _.template(str, data, {
      imports: this.cache.tags
    });
    if (str === original) {
      break;
    }
  }
  return str;
};
