'use strict';

var _ = require('lodash');


function Template(context, options) {
  this.context = context || {};
  this.options = options || {};
  var opts = this.options;
  this.cache = {};

  this.constant('cwd', opts.cwd || process.cwd());
  this._cache('partials', opts.partials || {});
  this._cache('layouts', opts.partials || {});
  this._cache('tags', opts.tags || {});

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

Template.prototype.partials = function (key, value) {
  var args = [].slice.call(arguments);
  _.extend.apply(_, [this.cache.partials].concat(args));
  return this;
};


/**
 * Layouts
 */

Template.prototype.layout = function (key, value) {
  this.cache.layouts[key] = value;
};


Template.prototype.layouts = function (key, value) {
  var args = [].slice.call(arguments);
  _.extend.apply(_, [this.cache.layouts].concat(args));
  return this;
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
    str = _.template(str, ctx, {imports: this.cache.tags});
    if (str === original) {
      break;
    }
  }
  return str;
};



var template = new Template();

console.log(template.cwd)

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
  d: 'D'
};

console.log(template.process('<%= partial("a") %>', ctx));
console.log(template.process('<%= partial("b") %>', ctx));
console.log(template.process('<%= partial("c") %>', ctx));
console.log(template.process('<%= partial("d") %>', ctx));
console.log(template.process('<%= include("test/fixtures/a.md") %>', ctx));
console.log(template.process('<%= include("test/fixtures/b.md") %>', ctx));
console.log(template.process('<%= glob("test/fixtures/*.md") %>', ctx));
console.log(template.process('<%= glob(["test/fixtures/*.md"]) %>', ctx));


// template.constant('a', 'b');

// console.log(template.a)



// var str = file.readFileSync('test/fixtures/readme.md');
// file.writeFileSync('test/fixtures/_authors.md', processTemplate(str, config, {delims: ['{%', '%}']}));