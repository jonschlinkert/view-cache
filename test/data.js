/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var _ = require('lodash');


describe('template data', function () {
  describe('.data():', function () {
    var template = new Template();
    template.partial('a', 'This is partial <%= a %>');
    template.partial('b', 'This is partial <%= b %>');

    it('should add a partial to `cache.partials`.', function () {
      var cache = Object.keys(template.cache.partials);
      cache.should.have.length(2);
    });

    it('should extend the `context` with data.', function () {
      template.data({a: 'A', b: 'B'});

      var a = template.process('<%= partial("a") %>');
      var b = template.process('<%= partial("b") %>');

      a.should.equal('This is partial A');
      b.should.equal('This is partial B');
    });

    it('should extend the `context` with data.', function () {
      template.data({a: 'C', b: 'D'});

      var a = template.process('<%= partial("a") %>');
      var b = template.process('<%= partial("b") %>');

      a.should.equal('This is partial C');
      b.should.equal('This is partial D');
    });
  });

  describe('.partials():', function () {
    var template = new Template();
    template.set('layoutTag', 'blah');

    template.partials({
      a: 'This is partial <%= a %>',
      b: 'This is partial <%= b %>',
      c: 'This is partial <%= c %>',
      d: 'This is partial <%= d %>'
    });

    it('should add multiple partials to `cache.partials`.', function () {
      var cache = Object.keys(template.cache.partials);
      cache.should.have.length(4);
    });

    it('should extend the context.', function () {
      template.data({a: 'A', b: 'B', c: 'C', d: 'D'});

      var a = template.process('<%= partial("a") %>');
      var b = template.process('<%= partial("b") %>');
      var c = template.process('<%= partial("c") %>');
      var d = template.process('<%= partial("d") %>');

      a.should.equal('This is partial A');
      b.should.equal('This is partial B');
      c.should.equal('This is partial C');
      d.should.equal('This is partial D');
    });

  });
});