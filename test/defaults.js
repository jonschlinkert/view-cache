/*!
 * template-cache <https://github.com/jonschlinkert/template-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var template = require('..');
var template = new template();

describe('template data', function() {
  beforeEach(function() {
    template.clear();
  });

  describe('.defaults()', function() {
    it('should set defaults on the `cache` object.', function() {
      template
        .defaults({x: 'x', y: 'y', z: 'z'})
        .defaults({a: 'a', b: 'b', c: 'c'});

      template.get().should.have.property('a');
      template.get().should.have.property('b');
      template.get().should.have.property('c');
      template.get().should.have.property('x');
      template.get().should.have.property('y');
      template.get().should.have.property('z');
    });
  });

  describe('.defaults()', function() {
    it('should not overwrite a value that already exists on the cache.', function() {
      template.defaults({a: 'aaa'});
      template.get('a').should.equal('aaa');
      template.defaults({a: 'bbb'});

      // Not today!
      template.get('a').should.not.equal('bbb');
    });

    it('should overwrite a value that already exists on the cache.', function() {
      template.defaults({a: 'aaa'});
      template.get('a').should.equal('aaa');
      template.set('a', 'bbb');

      // Nevermind :-(
      template.get('a').should.equal('bbb');
    });
  });

  describe('when a string is passed as the first param.', function() {
    it('should set defaults on the specified property on the cache.', function() {
      template
        .defaults('foo', {x: 'x', y: 'y', z: 'z'})
        .defaults('bar', {a: 'a', b: 'b', c: 'c'});

      template.get('bar').should.have.property('a');
      template.get('bar').should.have.property('b');
      template.get('bar').should.have.property('c');
      template.get('foo').should.have.property('x');
      template.get('foo').should.have.property('y');
      template.get('foo').should.have.property('z');
    });

    it('should set defaults on the `cache.data` object.', function() {
      template
        .defaults('data', {x: 'x', y: 'y', z: 'z'})
        .defaults('data', {a: 'a', b: 'b', c: 'c'});

      template.get('data').should.have.property('a');
      template.get('data').should.have.property('b');
      template.get('data').should.have.property('c');
      template.get('data').should.have.property('x');
      template.get('data').should.have.property('y');
      template.get('data').should.have.property('z');
    });
  });

  describe('when a string is passed as the first param.', function() {
    it('should set defaults on the specified property on the cache.', function() {
      template
        .defaults('foo.xyz', {x: 'x', y: 'y', z: 'z'})
        .defaults('bar.xyz', {a: 'a', b: 'b', c: 'c'});

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

    it('should set defaults on deep properties.', function() {
      template.defaults('a.b.c.d.xyz', {x: 'x', y: 'y', z: 'z'})

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
