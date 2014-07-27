'use strict';

var tmpl = require('template');
var _ = require('lodash');


var _template = require('./lib/');



function Template(context, tags) {
  this.context = context || {};
  this.tags = tags || {};
  this.partials = {};
  this.layouts = {};
}


Template.prototype.addTag = function (key, value) {
  this.tags[key] = value;
};


Template.prototype.constant = function(key, value){
  var getter;
  if (typeof value !== 'function'){
    getter = function() {
      return value;
    };
  } else {
    getter = value;
  }
  this.__defineGetter__(key, getter);
  return this;
};


Template.prototype.partial = function (key, value) {
  this.partials[key] = value;
};


Template.prototype.registerLayout = function (key, value) {
  this.layouts[key] = value;
};

Template.prototype.get = function (key, value) {
  return this.tags[key];
};

Template.prototype.process = function (str, context) {
  var ctx = _.extend({}, this.context, context);

  while (str.indexOf('${') >= 0 || str.indexOf('%>') >= 0) {
    str = _.template(str, ctx, {
      imports: this.tags
    });
    if (str === original) {
      break;
    }
  }
};



var template = new Template();

template.addTag('partial', require('./tags/partial')(template.partials));
template.addTag('include', require('./tags/include'));
template.addTag('log', require('./tags/log'));

template.partial('a', 'This is partial <%= a %>');
template.partial('b', 'This is partial <%= b %>');

var ctx = {
  a: 'A',
  b: 'B'
};

console.log(template.process('<%= partial("a") %>', ctx));
console.log(template.process('<%= partial("b") %>', ctx));


// template.constant('a', 'b');

// console.log(template.a)

// console.log(template.process('<%= include("README.md") %>'));


// var str = file.readFileSync('test/fixtures/readme.md');
// file.writeFileSync('test/fixtures/_authors.md', processTemplate(str, config, {delims: ['{%', '%}']}));