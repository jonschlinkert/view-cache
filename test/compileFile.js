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
// var engines = require('consolidate');
var engines = require('engines');


describe('template compileFile:', function () {
  describe('.compileFile()', function () {
    it('should read a file and compile templates.', function () {
      var template = new Template();
      template.engine('tmpl', engines.lodash);

      var compiled = template.compile('test/fixtures/no-matter.tmpl');
      console.log(compiled);

      // compiled.should.be.a.function;
      // Object.keys(template.cache.templates).length.should.equal(1)

      // var actual = compiled({ 'a': 'A' });
      // actual.should.be.a.string;

      // actual.should.equal('A');
    });
  });

  // describe('.compileFile()', function () {
  //   it('should read a file and compile templates.', function () {
  //     var template = new Template();
  //     var engine = {};
  //     engine.render = engine.renderFile = _.template;
  //     template.engine('tmpl', engine);

  //     console.log(template);

  //     // var compiled = template.compileFile('test/fixtures/no-matter.tmpl');
  //     // compiled.should.be.a.function;
  //     // Object.keys(template.cache.templates).length.should.equal(1)

  //     // var actual = compiled({ 'a': 'A' });
  //     // actual.should.be.a.string;

  //     // actual.should.equal('A');
  //   });
  // });

  // describe('.compileFiles()', function () {
  //   it('should read a glob of files as an array and compile the templates in each.', function () {
  //     var template = new Template();

  //     template.compileFiles(['test/fixtures/no-*.tmpl']);
  //     var fn = _.values(template.cache.templates)[0];
  //     fn.should.be.a.function;

  //     Object.keys(template.cache.templates).length.should.equal(1)

  //     var actual = fn({ 'a': 'A' });
  //     actual.should.be.a.string;
  //     actual.should.equal('A');
  //   });
  // });

  // describe('.compileFiles()', function () {
  //   it('should read a glob of files as a string and compile the templates in each.', function () {
  //     var template = new Template();

  //     template.compileFiles('test/fixtures/no-*.tmpl');
  //     var fn = _.values(template.cache.templates)[0];
  //     fn.should.be.a.function;

  //     Object.keys(template.cache.templates).length.should.equal(1)

  //     var actual = fn({ 'a': 'A' });
  //     actual.should.be.a.string;
  //     actual.should.equal('A');
  //   });
  // });
});
