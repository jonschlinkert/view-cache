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


describe('template render:', function () {
  describe('.render()', function () {
    it('should render templates with lodash.', function () {
      var template = new Template();
      var actual = template.renderFile('test/fixtures/no-matter.tmpl', {
        name: 'Jon Schlinkert'
      });

      actual.should.be.a.string;
      actual.should.equal('hello Jon Schlinkert');
    });
  });
});
