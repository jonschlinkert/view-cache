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


describe('template compile:', function () {
  describe('.compile()', function () {
    it('should compile templates with default delimiters.', function () {
      var compiled = template.compile('hello <%= name %>');
      compiled.should.be.a.function;

      var actual = compiled({ 'name': 'Jon Schlinkert' });
      actual.should.be.a.string;

      actual.should.equal('hello Jon Schlinkert');
    });

    it('should compile templates with es6 delimiters.', function () {
      var compiled = template.compile('hello ${ name }');
      compiled.should.be.a.function;

      var actual = compiled({ 'name': 'Jon Schlinkert' });
      actual.should.be.a.string;

      actual.should.equal('hello Jon Schlinkert');
    });
  });
});
