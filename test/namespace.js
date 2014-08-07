/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');
var template = new Template();


describe('template data', function () {
  describe('.namespace()', function() {
    it('should namespace data using the `:basename` of the file.', function() {
      template.namespace(':basename', 'test/fixtures/data/alert.json');
      template.get('data').should.have.property('alert');
    })

    it('should namespace data using the `:basename` of each file in a glob.', function() {
      template.namespace(':basename', 'test/fixtures/data/*.json');
      template.get('data').should.have.property('alert');
      template.get('data').should.have.property('test');

      // `data` property should be flattened by `template.flattenData()`
      template.get('data').should.not.have.property('data');
    });

    it('should namespace data using the `:basename` of each file, without having to define it.', function() {
      template.namespace(':basename', 'test/fixtures/data/*.json');
      template.get('data').should.have.property('alert');
      template.get('data').should.have.property('test');

      // `data` property should be flattened by `template.flattenData()`
      template.get('data').should.not.have.property('data');
    });

    it('should namespace data from an array of files.', function() {
      template.namespace(':basename', 'test/fixtures/data/*.json');
      template.get('data').should.have.property('alert');
      template.get('data').should.have.property('test');

      // `data` property should be flattened by `template.flattenData()`
      template.get('data').should.not.have.property('data');
    });

    it('should namespace data using the `:basename` of each file in an array of globs.', function() {
      template.namespace(':basename', ['test/fixtures/data/*.json']);
      template.get('data').should.have.property('alert');
      template.get('data').should.have.property('test');

      // `data` property should be flattened by `template.flattenData()`
      template.get('data').should.not.have.property('data');
    });

    it('should namespace data using the `:propstring`.', function() {
      template.namespace(':basename', 'test/fixtures/data/data.json');
      template.get('data').should.have.property('root');
      template.get('data').should.not.have.property('data');
    });
  });

  describe('when a `:propstring` is passed and matching context is found.', function() {
    it('should namespace data using value matching the `:propstring`.', function() {
      template.namespace(':foo', 'test/fixtures/data/data.json', {foo: 'bar'});
      template.get('data').should.have.property('bar');
    });
  });

  describe('when a `:propstring` is passed and NO matching context is found.', function() {
    it('should namespace data using the actual `:propstring`.', function() {
      template.namespace(':foo', 'test/fixtures/data/data.json');
      template.get('data').should.have.property('foo');
    });
  });

  describe('.namespace()', function() {
    it('should namespace data using the specified value.', function() {
      template.namespace('site', 'test/fixtures/data/data.json');
      template.get('data').should.have.property('site');
    });
  });
});