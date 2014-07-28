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


describe('template tags', function () {
  describe('cache.tags:', function () {
    it('should have default tags', function () {
      var template = new Template();
      var cache = Object.keys(template.cache.tags);
      cache.should.have.length(1);
    });
  });

  describe('.addTag():', function () {
    var template = new Template();

    template.addTag('include', require('../tags/include'));
    template.addTag('glob', require('../tags/glob')(template));
    template.addTag('log', require('../tags/log'));
    it('should add tags to `cache.tags`.', function () {
      var cache = Object.keys(template.cache.tags);
      cache.should.have.length(4);
    });

    var ctx = {
      a: 'A',
      b: 'B',
      c: 'C',
      d: 'D',
      layout: 'base'
    };

    it('should add tags to `cache.tags`.', function () {
      template.process('<%= include("test/fixtures/a.md") %>', ctx);
      template.process('<%= include("test/fixtures/b.md") %>', ctx);
    });
    it('should add tags to `cache.tags`.', function () {
      template.process('<%= glob("test/fixtures/*.md") %>', ctx);
      template.process('<%= glob(["test/fixtures/*.md"]) %>', ctx);
    });
    it('should add tags to `cache.tags`.', function () {
      template.process('<%= log("logging tag works!") %>', ctx);
    });
  });
});