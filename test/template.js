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


describe('.template():', function () {

  describe('create new template functions', function () {
    var template = new Template();
    it('should add a singluar verison of `type` to Template.', function () {
      template.template('beep', {plural: 'beeps'});
      Template.prototype.beep.should.be.a.function;
    });
    it('should add a plural verison of `options.plural` to Template.', function () {
      template.template('beep', {plural: 'beeps'});
      Template.prototype.beeps.should.be.a.function;
    });
  });

  describe('.beep()', function () {
    describe('set beeps on cache beeps.', function () {
      var template = new Template();
      it('should add a beep to `cache.beeps`.', function () {
        template.beep('a', 'This is beep <%= a %>');
        template.beep('b', 'This is beep <%= b %>');
        var cache = Object.keys(template.cache.beeps);
        cache.should.have.length(2);
      });

      it('should get beeps from the cache', function () {
        var a = template.beep('a');
        var b = template.beep('b');

        assert.equal(typeof a, 'object');
        assert.equal(typeof b, 'object');
      });

      it('should extend locals onto the cache.', function () {
        var template = new Template();
        template.beep('a', 'This is beep <%= a %>', {a: 'AAA'});
        template.beep('b', 'This is beep <%= b %>', {b: 'BBB'});

        template.beep('a').data.should.eql({a: 'AAA'});
        template.beep('b').data.should.eql({b: 'BBB'});
      });

      it('should use the correct locals for each beep.', function () {
        var template = new Template();
        template.beep('a', 'This is beep <%= title %>\n{{body}}', {title: 'AAA'});
        template.beep('b', 'This is beep <%= title %>\n{{body}}', {title: 'BBB'});
        var a = template.beep('a');

        template.beep('a').data.should.have.property('title');
        template.beep('b').data.should.have.property('title');
        template.beep('a').data.title.should.equal('AAA');
        template.beep('b').data.title.should.equal('BBB');
      });
    });

    describe('.get():', function () {
      var template = new Template();

      it('should get a beep from the cache', function () {
        template.beep('a', 'This is beep <%= a %>', {layout: 'a'});
        template.get('beeps').should.have.property('a');
        template.get('beeps.a').should.be.an.object;
      });

      it('should have a `data` property.', function () {
        template.beep('a', 'This is beep <%= a %>', {layout: 'a'});
        template.get('beeps.a').should.have.property('data');
      });

      it('should have a `layout` propert on the beep object.', function () {
        template.beep('a', 'This is beep <%= a %>', {layout: 'a'});
        template.get('beeps.a').should.have.property('layout');
      });

      it('should move all data to `data` property.', function () {
        template.beep('a', 'This is beep <%= a %>', {layout: 'a', a: 'a', b: 'b'});
        template.get('beeps.a').should.have.property('layout');
        template.get('beeps.a.data').should.have.property('a');
        template.get('beeps.a.data').should.have.property('b');
      });

      it('should have a `content` property.', function () {
        template.beep('a', 'This is beep <%= a %>', {layout: 'a'});
        template.get('beeps.a').should.have.property('content');
      });

      it('should have an `original` property.', function () {
        template.beep('a', 'This is beep <%= a %>', {layout: 'a'});
        template.get('beeps.a').should.have.property('original');
      });
    });
  });

  describe('.beeps()', function () {
    var template = new Template();
    template.template('beep', {plural: 'beeps'});
    template.beeps(['test/fixtures/*.md']);

    it('should add multiple beeps to `cache.beeps`.', function () {
      var cache = Object.keys(template.cache.beeps);
      cache.should.have.length(4);
    });

    it('should get beeps from the cache', function () {
      var a = template.beep('a');
      var b = template.beep('b');

      assert.equal(typeof a, 'object');
      assert.equal(typeof b, 'object');
    });
  });
});
