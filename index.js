/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var path = require('path');
var utils = require('utils')._;
var typeOf = require('kind-of');
var LoaderCache = require('loader-cache');
var pluralize = require('pluralize');
var set = require('set-value');
var get = require('get-value');

/**
 * Create an instance of Views with the given `options`.
 *
 * ```js
 * var Views = require('views');
 * var views = new Views();
 * ```
 * @param {Object} `options`
 */

function Views(options) {
  this.options = options || {};
  this.cache = this.options.viewCache || {};
  this.inflections = {};
  this.types = {};
  this._ = {};
  this.init();
}

Views.prototype.init = function() {
  this._.loaders = new LoaderCache(this.options.loaders);
  this.createType('layout');
  this.createType('renderable');
  this.createType('partial');
  this.createType('index');
};

Views.prototype.createType = function(name) {
  this.types[name] = this.types[name] || [];
  return this;
};

Views.prototype.loader = function() {
  this._.loaders.compose.apply(this._.loaders, arguments);
  return this;
};

Views.prototype.load = {
  sync: function() {
    this._.loaders.load.apply(this._.loaders, arguments);
    return this;
  },
  async: function() {
    // TODO
  },
  promise: function() {
    // TODO
  },
  stream: function() {
    // TODO
  }
};

/**
 * Assign `value` to `key` and save to disk. Can be
 * a key-value pair or an object.
 *
 * ```js
 * views.subtypeOptions('pages', 'a', 'b');
 * // or
 * views.subtypeOptions('pages', {a: 'b'});
 * console.log(views.cache.pages.options);
 * //=> {a: 'b'}
 * ```
 * @param {String} `key`
 * @param {*} `val` The value to save to `key`.
 * @return {Object} `Views` for chaining
 * @api public
 */

Views.prototype.subtypeOptions = function(subtype, key, val) {
  if (typeof val === 'function') {
    throw new Error('Views#set cannot set functions as values: ' + val.toString());
  }

  var plural = this.inflections[subtype];
  this.options[plural] = this.options[plural] || {};
  var opts = this.options[plural];

  if (arguments.length === 2 && typeof key === 'string') {
    return opts;
  }
  if (typeOf(key) === 'object') {
    utils.merge(opts, key);
  } else if (typeOf(val) === 'object') {
    set(opts, key, utils.merge(get(opts, key) || {}, val));
  } else {
    set(opts, key, val);
  }
  return this;
};

/**
 * Create view "types"
 *
 * @param  {String} `type` The singular name of the type, e.g. `page`
 * @param  {String} `plural` The plural name of the type, e.g. `pages.
 * @return {String}
 */

Views.prototype.create = function (subtype, opts, loaders) {
  if (Array.isArray(opts) || typeof opts === 'function') {
    loaders = opts; opts = {};
  }
  // decorate this `subtype` with its own get/set methods
  this.decorate(subtype, pluralize(subtype), opts || {}, loaders || []);
  return this;
};

function makeLoaders(lastFn) {
  return function normalize(args, loaders, opts) {
    loaders = arrayify(loaders);
    var result = [].concat.apply([], args);
    var stack = [], res = [];

    for (var i = result.length - 1; i > 0; i--) {
      var arg = result[i];
      if (typeof arg === 'string' || typeof arg === 'function') {
        stack = [arg].concat(stack);
        result.pop();
      }
    }

    stack = stack.concat(loaders).concat(lastFn);
    res.push.apply(res, result);
    res.push(stack);
    if (typeof opts === 'object') {
      res.push(opts);
    }
    return res;
  }
}

Views.prototype.decorate = function (subtype, plural, options, stack) {
  this.inflections[subtype] = plural;
  this.cache[plural] = this.cache[plural] || {};
  var loaders = this._.loaders, self = this;
  var loadType = options.load || 'sync';

  var toStack = makeLoaders(function (file) {
    var fp = file.path;
    var name = path.basename(fp, path.extname(fp));
    self.cache[name] = file;
    return file;
  });

  //=> '.pages'
  mixin(plural, function  (key, value, locals, opts) {
    var args = [].slice.call(arguments);
    var res = toStack(args, stack, options);
    return this.load[loadType].apply(this, res);
  });

  //=> '.page'
  mixin(subtype, function (/*template*/) {
    return this[plural].apply(this, arguments);
  });

  //=> '.getPage'
  mixin(methodName('get', subtype), function (key) {
    return this.cache[plural][key];
  });

  this.subtypeOptions(subtype, options);
};

function isLoader(val) {
  return Array.isArray(val) || typeof val === 'function';
}

/**
 * Add a method to the `Views` prototype.
 *
 * @param  {String} `method` The method name.
 * @param  {Function} `fn`
 * @api private
 */

function mixin(method, fn) {
  Views.prototype[method] = fn;
}

/**
 * Utility for getting an own property from an object.
 *
 * @param  {Object} `o`
 * @param  {Object} `prop`
 * @return {Boolean}
 * @api true
 */

function hasOwn(o, prop) {
  return {}.hasOwnProperty.call(o, prop);
}

/**
 * Coerce val to an array.
 */

function arrayify(val) {
  return Array.isArray(val) ? val : [val];
}

/**
 * Create a camel-cased method name for the given
 * `method` and `type`.
 *
 *     'get' + 'page' => `getPage`
 *
 * @param  {String} `type`
 * @param  {String} `name`
 * @return {String}
 */

function methodName(method, type) {
  return camelcase(method)
    + type.charAt(0).toUpperCase()
    + type.slice(1);
}

/**
 * Camemlcase the given string.
 *
 * @param  {String} str
 * @return {String}
 */

function camelcase(str) {
  if (str.length === 1) { return str; }
  str = str.replace(/^[-_.\s]+/, '').toLowerCase();
  return str.replace(/[-_.]+(\w|$)/g, function (_, ch) {
    return ch.toUpperCase();
  });
}


module.exports = Views;
