/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var assert = require('assert');
var should = require('should');
var Template = require('..');

var _ = require('lodash');


describe('template process:', function () {
  it('should render templates when data is passed:', function () {
    var template = new Template();
    var a = template.process('<%= a %>', {a: 'b'});

    assert(typeof a, 'string');
    a.should.equal('b');
  });

  it('should compile templates when no data is passed:', function () {
    var template = new Template();
    var a = template.process('<%= a %>');

    assert(typeof a, 'function');
  });

  it('should render templates when data and settings are passed:', function () {
    var template = new Template();
    template.addDelims('hbs', ['{{', '}}']);
    var a = template.process('{{= a }}', {a: 'b'}, {delims: 'hbs'});

    assert(typeof a, 'string');
    a.should.equal('b');
  });

  describe('when `null` is passed:', function () {
    it('should compile templates', function () {
      var template = new Template();
      var a = template.process('<%= a %>', null);

      assert(typeof a, 'function');
    });

    it('should compile templates when settings are passed:', function () {
      var template = new Template();
      template.addDelims(['{{', '}}']);
      var a = template.process('{{ a }}', null, {delims: 'hbs'});

      assert(typeof a, 'function');
    });
  });
});
