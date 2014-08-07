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
var engines = require('engines');

describe('template engines', function () {
  describe('.engine():', function () {
    it('should add engine defined as a function.', function () {
      var template = new Template();
      template.engine('hbs', engines.handlebars);

      var cache = Object.keys(template.cache.engines);
      cache.should.have.length(2);
    });
  });

  describe('.render():', function () {
    it('should render handlebars', function () {
      var template = new Template();
      template.engine('hbs', engines.handlebars);
      template.addDelims('hbs', ['{{','}}']);
      var tmpl = 'Hi {{name}}';
      var context = {
        name: 'Brian'
      };
      var settings = {
        ext: '.hbs',
        delims: 'hbs'
      };
      var actual = template.render(tmpl, context, settings);
      actual.should.equal('Hi Brian');
    });
  });
});
