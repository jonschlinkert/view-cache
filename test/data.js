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


describe('template data', function () {
  describe('.data():', function () {
    it('should extend the `context` with data.', function () {
      var template = new Template();
      template.data({a: 'A', b: 'B'});

      var data = template.cache.data;
      data.should.have.property('a');
      data.a.should.equal('A');
    });

    it('should be chainable.', function () {
      var template = new Template();
      template
        .data({a: 'A', b: 'B'})
        .data({c: 'C', d: 'D'});

      var data = template.cache.data;
      data.should.have.property('a');
      data.should.have.property('b');
      data.should.have.property('c');
      data.should.have.property('d');
      data.a.should.equal('A');
      data.b.should.equal('B');
      data.c.should.equal('C');
      data.d.should.equal('D');
    });

    it('should pass data to templates.', function () {
      var template = new Template();
      template.data({foo: 'A', bar: 'B'});

      template.partial('a', 'This is partial <%= foo %>');
      template.partial('b', 'This is partial <%= bar %>');

      var a = template.process('<%= partial("a") %>');
      var b = template.process('<%= partial("b") %>');

      a.should.equal('This is partial A');
      b.should.equal('This is partial B');
    });

    it('should have preference over global data.', function () {
      var template = new Template({foo: 'GLOBAL', bar: 'GLOBAL'});
      template.data({bar: 'B'});

      template.partial('a', 'This is partial <%= foo %>');
      template.partial('b', 'This is partial <%= bar %>');

      var a = template.process('<%= partial("a") %>');
      var b = template.process('<%= partial("b") %>');

      a.should.equal('This is partial GLOBAL');
      b.should.equal('This is partial B');
    });

    it('should NOT have preference over local data.', function () {
      var template = new Template({foo: 'GLOBAL', bar: 'GLOBAL'});
      template.data({foo: 'A', bar: 'B'});

      template.partial('a', 'This is partial <%= foo %>', {foo: 'LOCAL A'});
      template.partial('b', 'This is partial <%= bar %>', {bar: 'LOCAL B'});

      var a = template.process('<%= partial("a") %>');
      var b = template.process('<%= partial("b") %>');

      a.should.equal('This is partial LOCAL A');
      b.should.equal('This is partial LOCAL B');
    });

    it('should NOT have preference over template data.', function () {
      var template = new Template({foo: 'GLOBAL', bar: 'GLOBAL'});
      template.data({foo: 'A', bar: 'B'});

      template.partial('a', 'This is partial <%= foo %>');
      template.partial('b', 'This is partial <%= bar %>');

      var a = template.process('<%= partial("a", {foo: "LOCAL A"}) %>');
      var b = template.process('<%= partial("b", {bar: "LOCAL B"}) %>');

      a.should.equal('This is partial LOCAL A');
      b.should.equal('This is partial LOCAL B');
    });

    it('should NOT have preference over front matter.', function () {
      var template = new Template({foo: 'GLOBAL', bar: 'GLOBAL'});
      template.data({foo: 'A', bar: 'B'});

      template.partial('a', '---\nfoo: MATTER A\n---\nThis is partial <%= foo %>');
      template.partial('b', '---\nbar: MATTER B\n---\nThis is partial <%= bar %>');

      var a = template.process('<%= partial("a") %>');
      var b = template.process('<%= partial("b") %>');

      a.should.equal('This is partial MATTER A');
      b.should.equal('This is partial MATTER B');
    });
  });
});