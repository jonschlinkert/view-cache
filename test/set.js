/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template = new Template();


describe('.set():', function () {
  xdescribe('when templates are defined as objects:', function () {

  });
});



var template = new Template();

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
