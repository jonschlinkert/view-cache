/*
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert
 * Licensed under the MIT license.
 */
'use strict';

var should = require('should');
var engines = require('consolidate');
var _ = require('lodash');
var Template = require('..');
var template = new Template();

template.engine('*', engines.lodash);
// template.set('default engine', '*');


describe('templates:', function () {
  describe('when _.template is used:', function () {
    it('should process templates with default delimiters.', function () {
      var compiled = _.template('hello <%= name %>');
      var actual = compiled({ 'name': 'Jon Schlinkert' });
      actual.should.equal('hello Jon Schlinkert');
    });

    it('should process templates with es6 delimiters.', function () {
      var compiled = _.template('hello ${ name }');
      var actual = compiled({ 'name': 'Jon Schlinkert' });
      actual.should.equal('hello Jon Schlinkert');
    });
  });

  describe('when template is used:', function () {
    it('should process templates with default delimiters.', function () {
      var compiled = template.compile('hello <%= name %>');
      var actual = compiled({ 'name': 'Jon Schlinkert' });
      actual.should.equal('hello Jon Schlinkert');
    });

    it('should process templates with es6 delimiters.', function () {
      var compiled = template.compile('hello ${ name }');
      var actual = compiled({ 'name': 'Jon Schlinkert' });
      actual.should.equal('hello Jon Schlinkert');
    });
  });

  describe('when template is used:', function () {
    it('should process templates with default delimiters.', function () {
      var compiled = template.process('hello <%= name %>', { name: 'Jon Schlinkert' });
      compiled.should.equal('hello Jon Schlinkert');
    });

    it('should process templates with es6 delimiters.', function () {
      var compiled = template.process('hello ${ name }', { name: 'Jon Schlinkert' }, {delims: 'es6'});
      compiled.should.equal('hello Jon Schlinkert');
    });
  });

  describe('when a layout is defined on the options:', function () {
    var template = new Template({locals: {a: 'FIRST', b: 'SECOND', c: 'THIRD', d: 'FOURTH'}});

    it('should use the correct layout:', function () {
      template.layout('base', '\nbase\n{{body}}\nbase');
      template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
      template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
      template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'base'});

      template.partial('a', 'This is partial <%= a %>');
      template.partial('b', 'This is partial <%= b %>');
      template.partial('c', 'This is partial <%= c %>');
      template.partial('d', 'This is partial <%= d %>');

      var a = template.process('<%= partial("a") %>', {layout: 'a'});
      var b = template.process('<%= partial("b") %>', {layout: 'b'});
      var c = template.process('<%= partial("c") %>', {layout: 'c'});
      var d = template.process('<%= partial("d") %>', {layout: 'd'});

      a.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FIRST\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nbase');
      b.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND This is partial SECOND\nAFTER SECOND\nAFTER THIRD\nbase');
      c.should.equal('\nbase\n\nBEFORE THIRD This is partial THIRD\nAFTER THIRD\nbase');
      d.should.equal('This is partial FOURTH');
    });

    it('should use custom layout tags:', function () {
      template.layout('base', '\nbase\n{{foo}}\nbase');
      template.layout('a', '\nBEFORE <%= a %> {{foo}}\nAFTER <%= a %>', {layout: 'b'});
      template.layout('b', '\nBEFORE <%= b %> {{foo}}\nAFTER <%= b %>', {layout: 'c'});
      template.layout('c', '\nBEFORE <%= c %> {{foo}}\nAFTER <%= c %>', {layout: 'base'});

      template.partial('a', 'This is partial <%= a %>');
      template.partial('b', 'This is partial <%= b %>');
      template.partial('c', 'This is partial <%= c %>');
      template.partial('d', 'This is partial <%= d %>');

      var a = template.process('<%= partial("a") %>', {layout: 'a'}, {layoutTag: 'foo'});
      var b = template.process('<%= partial("b") %>', {layout: 'b'}, {layoutTag: 'foo'});
      var c = template.process('<%= partial("c") %>', {layout: 'c'}, {layoutTag: 'foo'});
      var d = template.process('<%= partial("d") %>', {layout: 'd'}, {layoutTag: 'foo'});

      a.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FIRST\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nbase');
      b.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND This is partial SECOND\nAFTER SECOND\nAFTER THIRD\nbase');
      c.should.equal('\nbase\n\nBEFORE THIRD This is partial THIRD\nAFTER THIRD\nbase');
      d.should.equal('This is partial FOURTH');
    });

    it('should use custom layout delimiters:', function () {
      template.layout('base', '\nbase\n{% foo %}\nbase');
      template.layout('a', '\nBEFORE <%= a %> {% foo %}\nAFTER <%= a %>', {layout: 'b'});
      template.layout('b', '\nBEFORE <%= b %> {% foo %}\nAFTER <%= b %>', {layout: 'c'});
      template.layout('c', '\nBEFORE <%= c %> {% foo %}\nAFTER <%= c %>', {layout: 'base'});

      template.partial('a', 'This is partial <%= a %>');
      template.partial('b', 'This is partial <%= b %>');
      template.partial('c', 'This is partial <%= c %>');
      template.partial('d', 'This is partial <%= d %>');

      var opts = {layoutTag: 'foo', layoutDelims: ['{%', '%}']};
      var a = template.process('<%= partial("a") %>', {layout: 'a'}, opts);
      var b = template.process('<%= partial("b") %>', {layout: 'b'}, opts);
      var c = template.process('<%= partial("c") %>', {layout: 'c'}, opts);
      var d = template.process('<%= partial("d") %>', {layout: 'd'}, opts);

      a.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FIRST\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nbase');
      b.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND This is partial SECOND\nAFTER SECOND\nAFTER THIRD\nbase');
      c.should.equal('\nbase\n\nBEFORE THIRD This is partial THIRD\nAFTER THIRD\nbase');
      d.should.equal('This is partial FOURTH');
    });
  });
});
