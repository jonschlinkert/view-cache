/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('..');
var engines = require('engines');
var _ = require('lodash');


describe('template engines:', function () {
  describe('.engine()', function () {
    it('should render templates with lodash.', function () {
      var template = new Template();
      template.engine('tmpl', engines.lodash);
      var actual = template.render('test/fixtures/lodash/no-matter.tmpl', {name: 'Jon Schlinkert'});
      actual.should.be.a.string;
      actual.should.equal('hello Jon Schlinkert');
    });

    it('should render templates with swig.', function () {
      var template = new Template();
      template.engine('tmpl', engines.swig);
      var actual = template.render('test/fixtures/swig/no-matter.tmpl', {name: 'Jon Schlinkert'});
      actual.should.be.a.string;
      actual.should.equal('hello Jon Schlinkert');
    });
  });

  describe('multiple engines', function () {
    var template = new Template();
    template.engine('hbs', engines.handlebars);
    template.engine('tmpl', engines.lodash);
    template.engine('html', engines.swig);

    it('should render templates using registered engines.', function () {
      var a = template.render('test/fixtures/engines/a.html', {name: 'Jon Schlinkert'});
      a.should.equal('hello Jon Schlinkert');

      var b = template.render('test/fixtures/engines/b.tmpl', {name: 'Jon Schlinkert'});
      b.should.equal('hello Jon Schlinkert');

      var c = template.render('test/fixtures/engines/d.hbs', {name: 'Jon Schlinkert'});
      c.should.equal('hello Jon Schlinkert');
    });
  });
});
