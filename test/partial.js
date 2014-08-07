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


describe('.partial():', function () {
  describe('set partials on cache partials.', function () {
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

      template.partial('a').data.should.eql({a: 'AAA'});
      template.partial('b').data.should.eql({b: 'BBB'});
    });

    it('should use the correct locals for each partial.', function () {
      var template = new Template();
      template.partial('a', 'This is partial <%= title %>\n{{body}}', {title: 'AAA'});
      template.partial('b', 'This is partial <%= title %>\n{{body}}', {title: 'BBB'});
      var a = template.partial('a');

      template.partial('a').data.should.have.property('title');
      template.partial('b').data.should.have.property('title');
      template.partial('a').data.title.should.equal('AAA');
      template.partial('b').data.title.should.equal('BBB');
    });
  });

  describe('.get():', function () {
    var template = new Template();

    it('should get a partial from the cache', function () {
      template.partial('a', 'This is partial <%= a %>', {layout: 'a'});
      template.get('partials').should.have.property('a');
      template.get('partials.a').should.be.an.object;
    });

    it('should have a `data` property.', function () {
      template.partial('a', 'This is partial <%= a %>', {layout: 'a'});
      template.get('partials.a').should.have.property('data');
    });

    it('should have a `layout` propert on the partial object.', function () {
      template.partial('a', 'This is partial <%= a %>', {layout: 'a'});
      template.get('partials.a').should.have.property('layout');
    });

    it('should move all data to `data` property.', function () {
      template.partial('a', 'This is partial <%= a %>', {layout: 'a', a: 'a', b: 'b'});
      template.get('partials.a').should.have.property('layout');
      template.get('partials.a.data').should.have.property('a');
      template.get('partials.a.data').should.have.property('b');
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
});
