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


describe('template delimiters:', function () {

  describe('.makeDelims:', function () {
    describe('when templates are defined as objects:', function () {
      var template = new Template();
      var delims = template.makeDelims(['[[', ']]']);
      delims.should.eql({
        beginning: '',
        matter: '([\\s\\S]+?)',
        body: '',
        end: '',
        flags: 'g',
        noncapture: false,
        escape: /\[\[-([\s\S]+?)\]\]/g,
        open: '\\[\\[',
        close: '\\]\\]',
        delims: [ '[[', ']]' ],
        evaluate: /\[\[([\s\S]+?)\]\]/g,
        interpolate: /\[\[=([\s\S]+?)\]\]/g
      });
    });
  });


  describe('.addDelims:', function () {
    it('should set delimiters by `name` on `template.delims`:', function () {
      var template = new Template();
      Object.keys(template.delims).should.have.length(2);
      template.addDelims('hbs', ['{{', '}}']);
      Object.keys(template.delims).should.have.length(3);
      template.addDelims('lodash', ['<%', '%>']);
      Object.keys(template.delims).should.have.length(4);
      template.addDelims('square', ['[[', ']]']);
      Object.keys(template.delims).should.have.length(5);
    });
  });


  describe('.getDelims:', function () {
    it('should get the currently defined delimiters:', function () {
      var template = new Template();
      template.addDelims('square', ['[[', ']]']);
      template.setDelims('square');

      var delims = template.getDelims();
      delims.should.eql({
        beginning: '',
        matter: '([\\s\\S]+?)',
        body: '',
        end: '',
        flags: 'g',
        noncapture: false,
        escape: /\[\[-([\s\S]+?)\]\]/g,
        open: '\\[\\[',
        close: '\\]\\]',
        delims: ['[[', ']]'],
        evaluate: /\[\[([\s\S]+?)\]\]/g,
        interpolate: /\[\[=([\s\S]+?)\]\]/g
      })
    });
  });


  describe('.setDelims:', function () {
    it('should use the currently set delims:', function () {
      var template = new Template();
      var ctx = {name: '____Jon Schlinkert____'};

      template.addDelims('lodash', ['<%', '%>']);
      template.addDelims('hbs', ['{{', '}}']);
      template.addDelims('square', ['[[', ']]']);


      // default template delims
      var a = template.process('${ name }[[= name ]]{{=name}}<%= name %>{%= name %}', ctx);
      a.should.equal('${ name }[[= name ]]{{=name}}____Jon Schlinkert____{%= name %}');

      // defined in the constructor
      template.setDelims('es6');
      var b = template.process('${ name }[[= name ]]{{=name}}<%= name %>{%= name %}', ctx);
      b.should.equal('____Jon Schlinkert____[[= name ]]{{=name}}<%= name %>{%= name %}');

      template.setDelims('square');
      var c = template.process('${ name }[[= name ]]{{=name}}<%= name %>{%= name %}', ctx);
      c.should.equal('${ name }____Jon Schlinkert____{{=name}}<%= name %>{%= name %}');

      template.setDelims('hbs');
      var d = template.process('${ name }[[= name ]]{{=name}}<%= name %>{%= name %}', ctx);
      d.should.equal('${ name }[[= name ]]____Jon Schlinkert____<%= name %>{%= name %}');

      // same as default
      template.setDelims('lodash');
      var e = template.process('${ name }[[= name ]]{{=name}}<%= name %>{%= name %}', ctx);
      e.should.equal('${ name }[[= name ]]{{=name}}____Jon Schlinkert____{%= name %}');
    });
  });


  describe('when strings with incomplete template delims are passed to an engine:', function () {
    it('should not hang:', function () {
      var template = new Template();
      template.addDelims('hbs', ['{{', '}}']);
      template.addDelims('square', ['[[', ']]']);

      var a = template.process('[[= name ]] ]]', {name: 'Jon'}, 'square');
      var b = template.process('[[= name ]] [[', {name: 'Jon'}, 'square');
      var c = template.process('{{= name }} {{', {name: 'Jon'}, 'hbs');
      var d = template.process('${ name } ${', {name: 'Jon'}, 'es6');
      var e = template.process('<%= name %> <%', {name: 'Jon'});

      a.should.equal('Jon ]]');
      b.should.equal('Jon [[');
      c.should.equal('Jon {{');
      d.should.equal('Jon ${');
      e.should.equal('Jon <%');
    });
  });
});
