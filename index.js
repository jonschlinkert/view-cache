'use strict';

var _ = require('lodash');
var Layouts = require('assemble-layouts');
var isFalsey = require('falsey');
var delims = require('delims');

var createDelim = function (str) {
  return str.replace(/(\s*)/g, '\\s*');
};


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

  this.layoutStack = {};
  this.defaultLayout = '{{ body }}';
  // this.regex = delims(layoutOpts.delims, layoutOpts).evaluate;
  // this.regex = createDelim(this.defaultLayout);
  this.regex = /\{{\s*body\s*}}/;
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

Template.prototype.partials = function (key, value) {
  var args = [].slice.call(arguments);
  _.extend.apply(_, [this.cache.partials].concat(args));
  return this;
};


/**
 * Layouts
 */

Template.prototype.layout = function (key, str, data) {
  this.cache.layouts[key] = {content: str, data: data || {}};
  return this;
};


Template.prototype.layouts = function (key, value) {
  var args = [].slice.call(arguments);
  _.extend.apply(_, [this.cache.layouts].concat(args));
  return this;
};


Template.prototype.injectLayout = function (outer, inner) {
  return outer.replace(this.regex, '\n' + inner + '\n');
};


Template.prototype.createStack = function (key) {
  key = this.useLayout(key);
  var template = null;
  var stack = [];
  while (key && (template = this.cache.layouts[key])) {
    stack.unshift(key);
    key = this.useLayout(template.data && template.data.layout);
  }
  return stack;
};

Template.prototype.useLayout = function (layout) {
  if (!layout || isFalsey(layout)) {
    return null;
  }
  return layout;
};


Template.prototype.wrap = function (str, options) {
  var file = {
    data: options && options.data || {},
    content: str
  };

  var opts = _.extend({}, this.options, file.data, options);
  var stack = this.createStack(opts.layout);

  // console.log('opts', opts)
  // console.log('stack', stack)

  // Setup the object to be returned, and store file.content on `orig`
  var results = {
    content: this.defaultLayout
  };

  results.data = opts.data;
  results.orig = str;

  // loop over the layout stack building the context and content
  results = stack.reduce(function (acc, key) {
    var layout = this.cache.layouts[key];
    acc.data = _.extend(acc.data, layout.data);
    acc.content = this.injectLayout(acc.content, layout.content);
    return acc;
  }.bind(this), results);

  // Pass the accumlated, final results
  results.data = _.extend(results.data, file.data);
  // results.content = this.injectLayout(results.content, str);
  results.content = results.content.replace(this.regex, str);
  if (!this.regex.test(str)) {
    return results;
  }
  return results;
};



/**
 * Get
 */

Template.prototype.get = function (key, value) {
  return this.cache.tags[key];
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
  var original = str;

  while (str.indexOf('${') >= 0 || str.indexOf('%>') >= 0) {
    str = _.template(this.wrap(str, ctx).content, ctx, {
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

// var ctx = {
//   a: 'A',
//   b: 'B',
//   c: 'C',
//   d: 'D',
//   layout: 'default'
// };

// console.log(template.process('<%= partial("a") %>', ctx));
// console.log(template.process('<%= partial("b") %>', ctx));
// console.log(template.process('<%= partial("c") %>', ctx));
// console.log(template.process('<%= partial("d") %>', ctx));
// console.log(template.process('<%= include("test/fixtures/a.md") %>', ctx));
// console.log(template.process('<%= include("test/fixtures/b.md") %>', ctx));
// console.log(template.process('<%= glob("test/fixtures/*.md") %>', ctx));
// console.log(template.process('<%= glob(["test/fixtures/*.md"]) %>', ctx));

template.constant('a', 'b');

template.layout('default', 'default\n{{body}}\ndefault', {layout: 'a'});
template.layout('a', 'BEFORE <%= a %> {{body}}AFTER <%= a %>', {layout: 'b'});
template.layout('b', 'BEFORE <%= b %> {{body}}AFTER <%= b %>', {layout: 'c'});
template.layout('c', 'BEFORE <%= c %> {{body}}AFTER <%= c %>');


// var res = template.wrap('foo', {data: {layout: 'default'}});
// console.log(res.content)

var ctx = {
  a: 'FIRST',
  b: 'SECOND',
  c: 'THIRD',
  d: 'FOURTH',
  layout: 'default'
};
var res = template.process('<%= partial("a") %>', ctx);

console.log(res);
