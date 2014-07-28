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


describe('template partials', function () {
  describe('.partial():', function () {
    var template = new Template();

    it('should add a partial to `cache.partials`.', function () {
      template.partial('a', 'This is partial <%= a %>');
      template.partial('b', 'This is partial <%= b %>');

      var cache = Object.keys(template.cache.partials);
      cache.should.have.length(2);
    });
  });

  describe('.partials():', function () {
    var template = new Template();

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

    it('should process partials defined using a `<%= partial() %>` tag.', function () {
      var ctx = {
        a: 'A',
        b: 'B',
        c: 'C',
        d: 'D'
      };

      var a = template.process('<%= partial("a") %>', ctx);
      var b = template.process('<%= partial("b") %>', ctx);
      var c = template.process('<%= partial("c") %>', ctx);
      var d = template.process('<%= partial("d") %>', ctx);

      a.should.equal('This is partial A');
      b.should.equal('This is partial B');
      c.should.equal('This is partial C');
      d.should.equal('This is partial D');
    });

  });
});