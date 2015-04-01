/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

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

Views.prototype.getLoaders = function(name, type) {
  return this._.loaders.cache[type || 'sync'][name];
};

Views.prototype.load = function() {
  this._.loaders.load.apply(this._.loaders, arguments);
  return this;
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

Views.prototype.decorate = function (subtype, plural, options, stack) {
  this.inflections[subtype] = plural;
  this.cache[plural] = this.cache[plural] || {};
  var loaders = this._.loaders;

  if (stack.length) {
    loaders.compose(subtype, stack);
  }


  function normalize(name, args, loaders, opts) {
    loaders = arrayify(loaders);
    var len = args.length;
    var last = args[len - 1];
    var res = [];

    if (Array.isArray(last)) {
      args = args.slice(0, len - 1);
      loaders = last.concat(loaders);
    } else if (typeof last === 'function') {
      args = args.slice(0, len - 1);
      loaders = [last].concat(loaders);
    }

    // while (len--) {
    //   var ele = args[len];
    //   // if (Array.isArray(ele)) {
    //   //   res = res.concat(ele);
    //   // } else if (typeof ele === 'function') {
    //   //   res.push(ele);
    //   // } else {
    //   //   break;
    //   // }
    //   if (Array.isArray(ele)) {
    //     args = args.slice(0, len - 1);
    //     loaders = ele.concat(loaders);
    //   } else if (typeof ele === 'function') {
    //     args = args.slice(0, len - 1);
    //     loaders = [ele].concat(loaders);
    //   } else {
    //     break;
    //   }
    // }

    res.push(args);
    res.push(loaders);
    if (typeof opts === 'object') {
      res.push(opts);
    }
    return res;
  }

  // function create(name, options, loaders) {
  //   return function () {
  //     var args = [].slice.call(arguments);
  //     var res = normalize(name, args, loaders);
  //     return self.load.apply(self, res);
  //   }
  // }

  // var loader = create(plural, getLoader);
  // console.log(this.getLoaders(subtype))

  //=> '.pages'
  mixin(plural, function  (key, value, locals, opts) {
    var args = [].slice.call(arguments);
    var res = normalize(subtype, args, stack, options);
    console.log(args)
    return this.load.apply(this, res);
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
 * Private method for tracking the `subtypes` created for each
 * view collection type. This can be used to get/set views
 * and pass them properly to registered engines. Also creates an
 * inflection-map between a `subtype` and its `plural` to use
 * for lookups.
 *
 * @param {String} `plural` e.g. `pages`
 * @param {Object} `opts`
 * @api private
 */

// Views.prototype.setType = function(collection, plural, opts) {
//   this.inflections[collection] = plural;
//   if (opts.isIndex) {
//     this.types.index.push(plural);
//   }
//   if (opts.isRenderable) {
//     this.types.renderable.push(plural);
//   }
//   if (opts.isLayout) {
//     this.types.layout.push(plural);
//   }
//   if (opts.isPartial || (!opts.isRenderable && !opts.isLayout && !opts.isIndex)) {
//     this.types.partial.push(plural);
//     opts.isPartial = true;
//   }
//   return opts;
// };

// Views.prototype._setType = function(subtype, plural) {
//   return this.views.hasOwnProperty(plural);
// };

// Views.prototype.pickTypes = function(opts) {
//   var types = [];
//   for (var key in this.types) {
//     var name = getName(key);
//     if (hasOwn(this.types, key) && hasOwn(opts, name)) {
//       types.push(name);
//     }
//   }
//   return types;
// };

// function getName(name) {
//   return name.substr(2).toLowerCase();
// }

// Views.prototype.hasType = function(plural) {
//   return this.views.hasOwnProperty(plural);
// };

// /**
//  * Get all view collections of the given `type`. Valid values are
//  * `renderable`, `layout`, `partial`, or `index`.
//  *
//  * ```js
//  * var pages = views.getType('renderable');
//  * //=> { pages: { 'home.hbs': { ... }, 'about.hbs': { ... }}, posts: { ... }}
//  * ```
//  *
//  * @param {String} `type` View type to get.
//  * @api public
//  */

// Views.prototype.getType = function(type) {
//   var arr = this.types[type];
//   var len = arr.length, i = 0;
//   var res = {};

//   while (len--) {
//     var plural = arr[i++];
//     res[plural] = this.views[plural];
//   }
//   return res;
// };

// Views.prototype.hasView = function(plural, key) {
//   return this.hasType(plural) && this.views[plural].hasOwnProperty(key);
// };


// /**
//  * Search all `subtype` objects of the given `type`, returning
//  * the first view found with the given `key`. Optionally pass
//  * an array of `subtypes` to limit the search;
//  *
//  * @param {String} `type` The view type to search.
//  * @param {String} `key` The view to find.
//  * @param {Array} `subtypes`
//  * @api public
//  */

// Views.prototype.find = function(type, key, subtypes) {
//   if (typeof type !== 'string') {
//     throw new TypeError('Views#find() expects `type` to be a string.');
//   }
//   var obj = {};
//   // var arr = Array.isArray(subtypes) ? subtypes : this.types[type];
//   // var len = arr.length, i = 0;

//   // while (len--) {
//   //   var collection = arr[i++];

//   // }

//   // if (!obj || !typeOf(obj) === 'object' || !hasOwn(obj, key)) {
//   //   throw new Error('Cannot find ' + type + ' view: "' + key + '"');
//   // }
//   return obj[key];
// };

// /**
//  * Search all renderable `subtypes`, returning the first view
//  * with the given `key`.
//  *
//  *   - If `key` is not found an error is thrown.
//  *   - Optionally limit the search to the specified `subtypes`.
//  *
//  * @param {String} `key` The view to search for.
//  * @param {Array} `subtypes`
//  * @api public
//  */

// Views.prototype.findRenderable = function(key, subtypes) {
//   return this.find('renderable', key, subtypes);
// };

// /**
//  * Search all layout `subtypes`, returning the first view
//  * with the given `key`.
//  *
//  *   - If `key` is not found an error is thrown.
//  *   - Optionally limit the search to the specified `subtypes`.
//  *
//  * @param {String} `key` The view to search for.
//  * @param {Array} `subtypes`
//  * @api public
//  */

// Views.prototype.findLayout = function(key, subtypes) {
//   return this.find('layout', key, subtypes);
// };

// /**
//  * Search all partial `subtypes`, returning the first view
//  * with the given `key`.
//  *
//  *   - If `key` is not found an error is thrown.
//  *   - Optionally limit the search to the specified `subtypes`.
//  *
//  * @param {String} `key` The view to search for.
//  * @param {Array} `subtypes`
//  * @api public
//  */

// Views.prototype.findPartial = function(key, subtypes) {
//   return this.find('partial', key, subtypes);
// };

// /**
//  * Search all partial `subtypes`, returning the first view
//  * with the given `key`.
//  *
//  *   - If `key` is not found an error is thrown.
//  *   - Optionally limit the search to the specified `subtypes`.
//  *
//  * @param {String} `key` The view to search for.
//  * @param {Array} `subtypes`
//  * @api public
//  */

// Views.prototype.findIndex = function(key, subtypes) {
//   return this.find('index', key, subtypes);
// };

// /**
//  * Convenience method for finding a view by `name` on
//  * the given collection. Optionally specify a file extension.
//  *
//  * @param {String} `plural` The view collection to search.
//  * @param {String} `name` The name of the view.
//  * @param {String} `ext` Optionally pass a file extension to append to `name`
//  * @api public
//  */

// Views.prototype.lookup = function(plural, name) {
//   var views = this.views[plural];
//   if (!views || !hasOwn(views, name)) {
//     throw new Error('Cannot find ' + plural + ': "' + name + '"');
//   }
//   return views[name];
// };

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
