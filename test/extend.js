/*!
 * template-cache <https://github.com/jonschlinkert/template-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Template = require('..');
var template = new Template();

describe('template data', function() {
  beforeEach(function() {
    template.clear();
  });

  describe('.extend()', function() {
    it('should extend the `cache` object.', function() {
      template
        .extend({x: 'x', y: 'y', z: 'z'})
        .extend({a: 'a', b: 'b', c: 'c'});

      template.get().should.have.property('a');
      template.get().should.have.property('b');
      template.get().should.have.property('c');
      template.get().should.have.property('x');
      template.get().should.have.property('y');
      template.get().should.have.property('z');
    });
  });

  describe('.extend()', function() {
    it('should update the cache with a new value for an existing property.', function() {
      template.extend({a: 'aaa'});
      template.get('a').should.equal('aaa');
      template.extend({a: 'bbb'});
      template.get('a').should.equal('bbb');
    });
  });

  describe('when a string is passed as the first param.', function() {
    it('should extend that property on the cache.', function() {
      template
        .extend('foo', {x: 'x', y: 'y', z: 'z'})
        .extend('bar', {a: 'a', b: 'b', c: 'c'});

      template.get('bar').should.have.property('a');
      template.get('bar').should.have.property('b');
      template.get('bar').should.have.property('c');
      template.get('foo').should.have.property('x');
      template.get('foo').should.have.property('y');
      template.get('foo').should.have.property('z');
    });

    it('should extend the `cache.data` object.', function() {
      template
        .extend('data', {x: 'x', y: 'y', z: 'z'})
        .extend('data', {a: 'a', b: 'b', c: 'c'});

      template.get('data').should.have.property('a');
      template.get('data').should.have.property('b');
      template.get('data').should.have.property('c');
      template.get('data').should.have.property('x');
      template.get('data').should.have.property('y');
      template.get('data').should.have.property('z');
    });
  });

  describe('when a string is passed as the first param.', function() {
    it('should extend that property on the cache.', function() {
      template
        .extend('foo.xyz', {x: 'x', y: 'y', z: 'z'})
        .extend('bar.xyz', {a: 'a', b: 'b', c: 'c'});

      template.get('bar.xyz').should.have.property('a');
      template.get('bar.xyz').should.have.property('b');
      template.get('bar.xyz').should.have.property('c');
      template.get('foo.xyz').should.have.property('x');
      template.get('foo.xyz').should.have.property('y');
      template.get('foo.xyz').should.have.property('z');

      template.cache.bar.should.have.property('xyz');
      template.cache.bar.should.have.property('xyz');
      template.cache.bar.should.have.property('xyz');
      template.cache.foo.should.have.property('xyz');
      template.cache.foo.should.have.property('xyz');
      template.cache.foo.should.have.property('xyz');
    });

    it('should extend deep properties.', function() {
      template.extend('a.b.c.d.xyz', {x: 'x', y: 'y', z: 'z'})

      template.get('a.b.c.d.xyz').should.have.property('x');
      template.get('a.b.c.d.xyz').should.have.property('y');
      template.get('a.b.c.d.xyz').should.have.property('z');

      template.cache.a.b.c.d.should.have.property('xyz');
      template.cache.a.b.c.d.should.have.property('xyz');
      template.cache.a.b.c.d.should.have.property('xyz');

      template.cache.a.b.c.d.xyz.should.have.property('x');
      template.cache.a.b.c.d.xyz.should.have.property('x');
      template.cache.a.b.c.d.xyz.should.have.property('x');
    });
  });
});
