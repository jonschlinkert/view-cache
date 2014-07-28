/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var template = new Template();
var _ = require('lodash');

// tags
var include = require('../tags/include');
var glob = require('../tags/glob')(template);
var log = require('../tags/log');


describe('template tags', function () {
  var ctx = {
    a: 'A',
    b: 'B',
    c: 'C',
    d: 'D',
    layout: 'base'
  };

  describe('.addTag():', function () {
    it('should add tags to `cache.tags`.', function () {
      template.addTag('include', include);
      template.process('<%= include("test/fixtures/a.md") %>', ctx);
      template.process('<%= include("test/fixtures/b.md") %>', ctx);
    });
    it('should add tags to `cache.tags`.', function () {
      template.addTag('glob', glob);
      template.process('<%= glob("test/fixtures/*.md") %>', ctx);
      template.process('<%= glob(["test/fixtures/*.md"]) %>', ctx);
    });
    it('should add tags to `cache.tags`.', function () {
      template.addTag('log', log);
      template.process('<%= log("log tag works!") %>', ctx);
    });
  });
});