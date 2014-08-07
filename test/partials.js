/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var _ = require('lodash');


describe('template partials', function () {

  xdescribe('.partial():', function () {
    var template = new Template();
    it('should add a partial to `cache.partials`.', function () {
      template.partial('a', 'This is partial <%= a %>');
      template.partial('b', 'This is partial <%= b %>');
      var cache = Object.keys(template.cache.partials);
      cache.should.have.length(2);
    });

    it('should get partials from the cache', function () {
      var a = template.partial('a');
      var b = template.partial('b');

      assert.equal(typeof a, 'object');
      assert.equal(typeof b, 'object');
    });

    it('should extend locals onto the cache.', function () {
      var template = new Template();
      template.partial('a', 'This is partial <%= a %>', {a: 'AAA'});
      template.partial('b', 'This is partial <%= b %>', {b: 'BBB'});

      template.partial('a').locals.should.eql({a: 'AAA'});
      template.partial('b').locals.should.eql({b: 'BBB'});
    });
  });

  describe('.get():', function () {
    var template = new Template();

    it('should get a partial from the cache', function () {
      template.partial('a', 'This is partial <%= a %>', {layout: 'a'});
      template.get('partials').should.have.property('a');
      template.get('partials.a').should.be.an.object;
    });

    it('should have a `locals` property.', function () {
      template.partial('a', 'This is partial <%= a %>', {layout: 'a'});
      template.get('partials.a').should.have.property('locals');
    });

    it('should have a `layout` propert on the `locals` property.', function () {
      template.partial('a', 'This is partial <%= a %>', {layout: 'a'});
      template.get('partials.a.locals').should.have.property('layout');
    });

    it('should move all data to `locals` property.', function () {
      template.partial('a', 'This is partial <%= a %>', {layout: 'a', a: 'a', b: 'b'});
      template.get('partials.a.locals').should.have.property('layout');
      template.get('partials.a.locals').should.have.property('a');
      template.get('partials.a.locals').should.have.property('b');
    });

    it('should have a `content` property.', function () {
      template.partial('a', 'This is partial <%= a %>', {layout: 'a'});
      template.get('partials.a').should.have.property('content');
    });

    it('should have an `original` property.', function () {
      template.partial('a', 'This is partial <%= a %>', {layout: 'a'});
      template.get('partials.a').should.have.property('original');
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

    it('should get partials from the cache', function () {
      var a = template.partial('a');
      var b = template.partial('b');

      assert.equal(typeof a, 'object');
      assert.equal(typeof b, 'object');
    });
  });

  describe('when partials are defined using a `<%= partial() %>` tag:', function () {
    xit('should process them with the given context.', function () {
      var template = new Template();

      template.partials({
        a: 'This is partial <%= a %>',
        b: 'This is partial <%= b %>'
      });

      var ctx = {a: 'A', b: 'B'};
      var a = template.process('<%= partial("a") %>', ctx);
      var b = template.process('<%= partial("b") %>', ctx);

      assert.equal(typeof a, 'string');
      assert.equal(typeof b, 'string');
      assert.equal(typeof template.partial('a'), 'object');
      assert.equal(typeof template.partial('b'), 'object');

      a.should.equal('This is partial A');
      b.should.equal('This is partial B');
    });

    xit('should use layouts when defined on `template.process()`', function () {
      var template = new Template({locals: {title: 'GLOBAL'}});

      template.partial('a', 'This is partial <%= a %>');
      template.partial('b', 'This is partial <%= b %>');
      template.partial('c', 'This is partial <%= c %>');
      template.partial('d', 'This is partial <%= d %>');

      var a = template.process('<%= partial("a", {layout: "a"}) %>', {title: 'Local AA'});
      var b = template.process('<%= partial("b", {layout: "a"}) %>', {title: 'Local BB'});
      var c = template.process('<%= partial("c", {layout: "a"}) %>', {title: 'Local CC'});
      var d = template.process('<%= partial("d", {layout: "a"}) %>', {title: 'Local DD'});

      a.should.equal('This is partial AA');
      b.should.equal('This is partial BB');
      c.should.equal('This is partial CC');
      d.should.equal('This is partial DD');
    });

  });
});