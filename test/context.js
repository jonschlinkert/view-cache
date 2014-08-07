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


describe('template context', function () {
  describe('when partials are defined using a `<%= partial() %>` tag:', function () {
    it('should process them with the given context.', function () {
      var template = new Template();

      template.partials(['test/fixtures/*.md']);

      var ctx = {a: 'A', b: 'B'};
      var a = template.process('<%= partial("a") %>', ctx);
      var b = template.process('<%= partial("b") %>', ctx);

      assert.equal(typeof a, 'string');
      assert.equal(typeof b, 'string');
      assert.equal(typeof template.partial('a'), 'object');
      assert.equal(typeof template.partial('b'), 'object');

      a.should.equal('hello A');
      b.should.equal('hello B');
    });

    it('should use locals define on the constructor as context', function () {
      var template = new Template({locals: {title: 'GLOBAL'}});

      template.partial('a', 'This is partial <%= title %>');
      template.partial('b', 'This is partial <%= title %>');
      template.partial('c', 'This is partial <%= title %>');
      template.partial('d', 'This is partial <%= title %>');

      var a = template.process('<%= partial("a", {layout: "a"}) %>');
      var b = template.process('<%= partial("b", {layout: "a"}) %>');
      var c = template.process('<%= partial("c", {layout: "a"}) %>');
      var d = template.process('<%= partial("d", {layout: "a"}) %>');

      a.should.equal('This is partial GLOBAL');
      b.should.equal('This is partial GLOBAL');
      c.should.equal('This is partial GLOBAL');
      d.should.equal('This is partial GLOBAL');
    });

    it('should give method-locals preference over constructor-locals.', function () {
      var template = new Template({locals: {title: 'GLOBAL'}});

      template.partial('a', 'This is partial <%= title %>');
      template.partial('b', 'This is partial <%= title %>');
      template.partial('c', 'This is partial <%= title %>');
      template.partial('d', 'This is partial <%= title %>');

      var a = template.process('<%= partial("a", {layout: "a"}) %>', {title: 'AA'});
      var b = template.process('<%= partial("b", {layout: "a"}) %>', {title: 'BB'});
      var c = template.process('<%= partial("c", {layout: "a"}) %>', {title: 'CC'});
      var d = template.process('<%= partial("d", {layout: "a"}) %>', {title: 'DD'});

      a.should.equal('This is partial AA');
      b.should.equal('This is partial BB');
      c.should.equal('This is partial CC');
      d.should.equal('This is partial DD');
    });

    it('should give partial-locals preference over method-locals.', function () {
      var template = new Template({locals: {title: 'GLOBAL'}});

      template.partial('a', 'This is partial <%= title %>', {title: 'WWW'});
      template.partial('b', 'This is partial <%= title %>', {title: 'XXX'});
      template.partial('c', 'This is partial <%= title %>', {title: 'YYY'});
      template.partial('d', 'This is partial <%= title %>', {title: 'ZZZ'});

      var a = template.process('<%= partial("a", {layout: "a"}) %>', {title: 'AA'});
      var b = template.process('<%= partial("b", {layout: "a"}) %>', {title: 'BB'});
      var c = template.process('<%= partial("c", {layout: "a"}) %>', {title: 'CC'});
      var d = template.process('<%= partial("d", {layout: "a"}) %>', {title: 'DD'});

      a.should.equal('This is partial WWW');
      b.should.equal('This is partial XXX');
      c.should.equal('This is partial YYY');
      d.should.equal('This is partial ZZZ');
    });

    it('should give context defined in the template params preference over partial-locals.', function () {
      var template = new Template({locals: {title: 'GLOBAL'}});

      template.partial('a', 'This is partial <%= title %>', {title: 'WWW'});
      template.partial('b', 'This is partial <%= title %>', {title: 'XXX'});
      template.partial('c', 'This is partial <%= title %>', {title: 'YYY'});
      template.partial('d', 'This is partial <%= title %>', {title: 'ZZZ'});

      var a = template.process('<%= partial("a", {title: "a"}) %>', {title: 'AA'});
      var b = template.process('<%= partial("b", {title: "b"}) %>', {title: 'BB'});
      var c = template.process('<%= partial("c", {title: "c"}) %>', {title: 'CC'});
      var d = template.process('<%= partial("d", {title: "d"}) %>', {title: 'DD'});

      a.should.equal('This is partial a');
      b.should.equal('This is partial b');
      c.should.equal('This is partial c');
      d.should.equal('This is partial d');
    });

    it('should give front-matter preference over partial-locals.', function () {
      var template = new Template({locals: {title: 'GLOBAL'}});

      template.partial('a', '---\ntitle: A1\n---\nThis is partial <%= title %>', {title: 'WWW'});
      template.partial('b', '---\ntitle: B1\n---\nThis is partial <%= title %>', {title: 'XXX'});
      template.partial('c', '---\ntitle: C1\n---\nThis is partial <%= title %>', {title: 'YYY'});
      template.partial('d', '---\ntitle: D1\n---\nThis is partial <%= title %>', {title: 'ZZZ'});

      var a = template.process('<%= partial("a", {layout: "a"}) %>', {title: 'AA'});
      var b = template.process('<%= partial("b", {layout: "a"}) %>', {title: 'BB'});
      var c = template.process('<%= partial("c", {layout: "a"}) %>', {title: 'CC'});
      var d = template.process('<%= partial("d", {layout: "a"}) %>', {title: 'DD'});

      a.should.equal('This is partial A1');
      b.should.equal('This is partial B1');
      c.should.equal('This is partial C1');
      d.should.equal('This is partial D1');
    });

  });
});