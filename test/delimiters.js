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


describe('template delimiters:', function () {
  describe('.makeDelims:', function () {
    describe('when templates are defined as objects:', function () {
    });
  });
  describe('.addDelims:', function () {
    describe('when templates are defined as objects:', function () {
      template.addDelims('hbs', ['{{', '}}']);
      template.addDelims('lodash', ['<%', '%>']);
      template.addDelims('square', ['[[', ']]']);

      template.setDelims('square');
      template.setDelims('hbs');
      template.setDelims('lodash');

      console.log(template.process('[[= name ]] ]]', {name: 'Jon'}, 'square'));
      console.log(template.process('[[= name ]] [[', {name: 'Jon'}, 'square'));
      console.log(template.process('[[= name ]]', {name: 'Jon'}, 'square'));
      console.log(template.process('{{=name}}', {name: 'Jon'}, 'hbs'));
      console.log(template.process('<%= name %> <%', {name: 'Jon'}));
    });
  });
  describe('.setDelims:', function () {
    describe('when templates are defined as objects:', function () {

    });
  });
  describe('.getDelims:', function () {
    describe('when templates are defined as objects:', function () {

    });
  });
});
