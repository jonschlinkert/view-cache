/*
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert
 * Licensed under the MIT license.
 */
'use strict';

var should = require('should');
var engines = require('consolidate');
var _ = require('lodash');
var Template = require('..');
var template = new Template();

template.engine('*', engines.lodash);
// template.set('default engine', '*');


describe('templates:', function () {
  describe('when _.template is used:', function () {
    it('should process templates with default delimiters.', function () {
      var compiled = _.template('hello <%= name %>');
      var actual = compiled({ 'name': 'Jon Schlinkert' });
      actual.should.equal('hello Jon Schlinkert');
    });

    it('should process templates with es6 delimiters.', function () {
      var compiled = _.template('hello ${ name }');
      var actual = compiled({ 'name': 'Jon Schlinkert' });
      actual.should.equal('hello Jon Schlinkert');
    });
  });

  // describe('when template is used:', function () {
  //   it('should process templates with default delimiters.', function () {
  //     var compiled = template.compile('hello <%= name %>');
  //     var actual = compiled({ 'name': 'Jon Schlinkert' });
  //     actual.should.equal('hello Jon Schlinkert');
  //   });

  //   it('should process templates with es6 delimiters.', function () {
  //     var compiled = template.compile('hello ${ name }');
  //     var actual = compiled({ 'name': 'Jon Schlinkert' });
  //     actual.should.equal('hello Jon Schlinkert');
  //   });
  // });

  describe('when template is used:', function () {
    it('should process templates with default delimiters.', function () {
      var compiled = template.process('hello <%= name %>', { name: 'Jon Schlinkert' });
      compiled.should.equal('hello Jon Schlinkert');
    });

    it('should process templates with es6 delimiters.', function () {
      var compiled = template.process('hello ${ name }', { name: 'Jon Schlinkert' }, 'es6');
      compiled.should.equal('hello Jon Schlinkert');
    });
  });
});
