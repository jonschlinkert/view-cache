/*!
 * view-cache <https://github.com/jonschlinkert/view-cache>
 *
 * Copyright (c) 2015 Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

/* deps:mocha */
var assert = require('assert');
var should = require('should');
var views = require('./');

describe('views', function () {
  describe('errors', function () {
    // it('should throw an error when:', function () {
    //   (function () {
    //     views();
    //   }).should.throw('view-cache expects valid arguments');
    // });
  });

  describe('.createFamily()', function () {
    it('should create a new template family:', function () {
      views.createFamily('renderable');
      views.families.should.should.have.property('renderable');
    });
  });

  // describe('.create()', function () {
  //   it('should map the inflection for a type:', function () {
  //     views.create('orange');
  //     views.inflections.should.should.have.property('a');
  //   });

  //   it('should create a  type:', function () {
  //     views.create('apple');
  //     views.cache.should.should.have.property('apple');
  //   });
  //   it('should create a new template type:', function () {
  //     views('a').should.eql({a: 'b'});
  //     views('a').should.equal('a');
  //   });
  // });
});
