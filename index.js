'use strict';

var _ = require('lodash');
var Layouts = require('layouts');


function Template(context, options) {
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
}


/**
 * Constants
 */

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

/**
 * Data
 */

Template.prototype.context = function (key, value) {
  this.cache.tags[key] = value;
};

Template.prototype.data = function (key, value) {
  this.cache.tags[key] = value;
};


/**
 * Tags
 */

Template.prototype.addTag = function (key, value) {
  this.cache.tags[key] = value;
};


Template.prototype.defaultTags = function () {
  this.addTag('partial', function (name) {
    return this.cache.partials[name];
  }.bind(this));

  this.addTag('layout', function (name) {
    return this.cache.partials[name];
  }.bind(this));
};


/**
 * Partials
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



var template = new Template();

// console.log(template.cwd)

// template.addTag('partial', require('./tags/partial')(template.partials));
template.addTag('include', require('./tags/include'));
template.addTag('glob', require('./tags/glob')(template));
template.addTag('log', require('./tags/log'));

template.partial('a', 'This is partial <%= a %>');
template.partial('b', 'This is partial <%= b %>');
template.partials({
  c: 'This is partial <%= c %>',
  d: 'This is partial <%= d %>'
});

var ctx = {
  a: 'A',
  b: 'B',
  c: 'C',
  d: 'D',
  layout: 'base'
};

console.log(template.process('<%= partial("a") %>', ctx));
console.log(template.process('<%= partial("b") %>', ctx));
console.log(template.process('<%= partial("c") %>', ctx));
console.log(template.process('<%= partial("d") %>', ctx));
// console.log(template.process('<%= include("test/fixtures/a.md") %>', ctx));
// console.log(template.process('<%= include("test/fixtures/b.md") %>', ctx));
// console.log(template.process('<%= glob("test/fixtures/*.md") %>', ctx));
// console.log(template.process('<%= glob(["test/fixtures/*.md"]) %>', ctx));

// template.constant('a', 'b');

template.layout('base', '\nbase\n{{body}}\nbase');
template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'base'});

console.log(template.layouts())


var ctx = {
  a: 'FIRST',
  b: 'SECOND',
  c: 'THIRD',
  d: 'FOURTH',
  layout: 'a'
};
var res = template.process('\n<%= partial("a") %>', ctx);
console.log(res);
