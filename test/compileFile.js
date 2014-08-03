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


describe('template compileFile:', function () {
  describe('.compileFile()', function () {
    it('should read a file and compile templates.', function () {
      var template = new Template();
      template.data({name: 'Jon Schlinkert'});

      var compiled = template.compileFile('test/fixtures/no-matter.tmpl');

      compiled.should.be.a.function;
      var actual = compiled({ 'name': 'A' });
      actual.should.be.a.string;
      actual.should.equal('hello A');
    });
  });

});
