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


describe('template helpers', function () {
  describe('cache.helpers:', function () {
    it('should have default helpers', function () {
      var template = new Template();
      var cache = Object.keys(template.cache.helpers);
      cache.should.have.length(1);
    });
  });

  describe('.addHelper():', function () {
    var template = new Template();

    template.addHelper('include', require('../helpers/include'));
    template.addHelper('glob', require('../helpers/glob')(template));
    template.addHelper('log', require('../helpers/log'));

    it('should add helpers to `cache.helpers`.', function () {
      var cache = Object.keys(template.cache.helpers);
      cache.should.have.length(4);
    });

    var ctx = {
      a: 'A',
      b: 'B',
      c: 'C',
      d: 'D'
    };

    it('should add helpers to `cache.helpers`.', function () {
      template.process('<%= include("test/fixtures/a.md") %>', ctx);
      template.process('<%= include("test/fixtures/b.md") %>', ctx);
    });

    it('should add helpers to `cache.helpers`.', function () {
      template.process('<%= glob("test/fixtures/*.md") %>', ctx);
      template.process('<%= glob(["test/fixtures/*.md"]) %>', ctx);
    });

    it('should add helpers to `cache.helpers`.', function () {
      template.process('<%= log("logging tag works!") %>', ctx);
    });
  });

  describe('.addHelpers():', function () {
    var template = new Template();

    template.addHelpers('helpers/*.js');

    it('should add helpers to `cache.helpers`.', function () {
      var cache = Object.keys(template.cache.helpers);

      // includes the default `partial` helper
      cache.should.have.length(5);
    });

    var ctx = {
      a: 'A',
      b: 'B',
      c: 'C',
      d: 'D'
    };

    it('should add helpers to `cache.helpers`.', function () {
      template.process('<%= include("test/fixtures/a.md") %>', ctx);
      template.process('<%= include("test/fixtures/b.md") %>', ctx);
    });

    it('should add helpers to `cache.helpers`.', function () {
      template.process('<%= glob("test/fixtures/*.md") %>', ctx);
      template.process('<%= glob(["test/fixtures/*.md"]) %>', ctx);
    });

    it('should add helpers to `cache.helpers`.', function () {
      template.process('<%= log("logging tag works!") %>', ctx);
    });
  });
});