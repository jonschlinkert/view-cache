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


describe('template engines:', function () {
  describe('.engine()', function () {
    it('should register an engine.', function () {
      var engine = {};
      engine.render = engine.renderFile = _.template;
      template.engine('tmpl', engine);
    });

    it('should register an engine.', function () {
      var engine = {};
      engine.render = engine.renderFile = _.template;
      template.engine('tmpl', engine);

    });
  });
});
