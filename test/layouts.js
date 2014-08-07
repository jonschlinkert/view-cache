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


/**
 * TODO:
 *
 * + should use layouts defined:
 *
 *   - globally
 *   - template.layout() method locals
 *   - template.layout() method front matter
 *   - template locals (<%= partial("a", {layout: 'a'}) %>)
 *   - template.partial() method locals
 *   - template.partial() method front matter
 *   - template.page() method locals
 *   - template.page() method front matter
 *   - template.process() method locals
 *   - template.render() method locals
 *   - template.renderFile() method locals
 *   - in front matter
 *   - in a parent template
 *
 * + should prefer layouts defined in:
 *   - method locals over global
 *   - template locals over method locals
 *   - front matter over template locals
 */

describe('template layouts', function () {
  describe('.layout():', function () {
    it('should add layouts defined as  strings to `cache.layouts`.', function () {
      var template = new Template();
      template.layout('a', 'This is layout <%= a %>');
      template.layout('b', 'This is layout <%= b %>');

      var cache = Object.keys(template.cache.layouts);
      cache.should.have.length(2);
    });

    it('should get layouts.', function () {
      var template = new Template();
      template.layout('a', 'This is layout <%= a %>', {a: 'b'});
      template.layout('b', 'This is layout <%= b %>', {a: 'd'});

      template.get('layouts').a.should.have.property('data');
      template.get('layouts').b.should.have.property('data');
    });

    it('should get layouts using nested object references.', function () {
      var template = new Template();
      template.layout('a', 'This is layout <%= a %>', {a: 'b'});
      template.layout('b', 'This is layout <%= b %>', {a: 'd'});

      template.get('layouts.a').should.have.property('data');
      template.get('layouts.b').should.have.property('data');
    });

    it('should add layouts defined as objects to `cache.layouts`.', function () {
      var template = new Template();
      template.layout('a', 'This is layout <%= a %>', {a: 'b'});
      template.layout('b', 'This is layout <%= b %>', {a: 'd'});

      var layouts = template.cache.layouts;
      layouts.should.have.property('a');
      layouts.should.have.property('b');
      Object.keys(layouts).should.have.length(2);
    });

    it('when template are defined as objects:', function () {
      var template = new Template();
      template.layout('last', 'last!\n{{body}}\nlast!');
      template.layout('a', 'A above\n{{body}}\nA below', {layout: 'b'});
      template.layout('b', 'B above\n{{body}}\nB below', {layout: 'c'});
      template.layout('c', 'C above\n{{body}}\nC below', {layout: 'last'});

      var ctx = {
        title: 'Page!',
        layout: 'a'
      };

      var actual = template.process('I\'m a <%= title %>', ctx);
      var expected = [
        'last!',
        'C above',
        'B above',
        'A above',
        'I\'m a Page!',
        'A below',
        'B below',
        'C below',
        'last!'
      ].join('\n');
      actual.should.eql(expected);
    });
  });
  describe('layout locals:', function () {
    it('should move locals to a `data` property.', function () {
      var template = new Template();
      template.layout('a', 'This is layout <%= a %>', {a: 'b'});
      template.layout('b', 'This is layout <%= b %>', {a: 'd'});

      template.get('layouts.a').should.have.property('data');
      template.get('layouts.b').should.have.property('data');
    });
  });

  describe('.layouts():', function () {
    it('should process layouts defined as strings when the `<%= partial() %>` tag is used.', function () {
      var template = new Template();
      template.layout('default', '\ndefault\n{{body}}\ndefault');
      template.layout('mini', '\nmini\n{{body}}\nmini');
      template.page('home', 'This is the <%= title %> page', {layout: 'default', title: 'HOME'});
      template.partial('a', 'This is partial <%= a %>', {layout: 'mini', a: 'A'});

      var actual = template.render('home');
      actual.should.eql('default\nThis is the HOME page\ndefault');
    });

    it('should stack layouts when the `<%= partial() %>` tag is used.', function () {
      var template = new Template();

      template.layout('last', '\nlast\n{{body}}\nlast');
      template.layout('b', '\nBEFORE <%= title %> {{body}}\nAFTER <%= title %>', {
        title: 'BBB',
        layout: 'last',
      });
      template.layout('a', '\nBEFORE <%= title %> {{body}}\nAFTER <%= title %>', {
        title: 'AAA',
        layout: 'b'
      });

      template.partial('a', 'This is partial <%= a %>', {layout: 'a', a: 'A'});

      var actual = template.process('\n<%= partial("a") %>', {a: 'A'})
      actual.should.eql('\nBEFORE A \nlast\n\nThis is partial A\nlast\nAFTER A');
    });

    xit('should stack layouts when the `<%= partial() %>` tag is used.', function () {
      var template = new Template();
      template.layout('last', '\nlast\n{{body}}\nlast', {layout: 'a'});
      template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'last'});

      template.partial('a', 'This is partial <%= a %>');

      var actual = template.process('\n<%= partial("a") %>', {layout: 'a', a: 'A'})
      actual.should.eql('\nBEFORE A \nlast\n\nThis is partial A\nlast\nAFTER A');
    });

    it('should assign a layout to a partial in locals on a method.', function () {
      var template = new Template();

      template.partial('a', 'This is partial <%= title %>\n{{body}}', {title: 'AAA'});
      template.layout('one', '\nBEFORE <%= title %> {{body}}\nAFTER <%= title %>', {layout: 'last', title: 'LAYOUT ONE'});
      template.layout('last', '\nlast\n{{body}}\nlast');

      var actual = template.process('\n<%= partial("a") %>', {layout: 'one', a: 'A', b: 'B'})
      actual.should.eql('last\nBEFORE LAYOUT ONE This is partial AAA\n{{body}}\nAFTER LAYOUT ONE\nlast');
    });

    xit('should process complex nested layouts when the `<%= partial() %>` tag is used.', function () {
      var template = new Template();

      template.layout('last', '\nlast\n{{body}}\nlast');
      template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
      template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
      template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'last'});

      var ctx = {
        a: 'FIRST',
        b: 'SECOND',
        c: 'THIRD',
        d: 'FOURTH',
        layout: 'a'
      };

      template.partial('a', 'This is partial <%= a %>');
      template.partial('b', 'This is partial <%= b %>');
      template.partials({
        c: 'This is partial <%= c %>',
        d: 'This is partial <%= d %>'
      });

      var a = template.process('<%= partial("a") %>', ctx);
      var b = template.process('<%= partial("b") %>', ctx);
      var c = template.process('<%= partial("c") %>', ctx);
      var d = template.process('<%= partial("d") %>', ctx);

      a.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FIRST\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
      b.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial SECOND\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
      c.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial THIRD\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
      d.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FOURTH\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
    });

    it('should prefer layouts defined on the locals over a default layout.', function () {
      var template = new Template({locals: {a: '_A_', b: '_B_', c: '_C_', d: '_D_'}});

      template.layout('GLOBAL', '\nGLOBAL\n{{body}}\nGLOBAL');
      template.layout('last', '\nlast\n{{body}}\nlast');
      template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
      template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
      template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'last'});

      template.partial('a', 'This is partial <%= a %>', {layout: 'a'});
      template.partial('b', 'This is partial <%= b %>', {layout: 'b'});
      template.partial('c', 'This is partial <%= c %>', {layout: 'c'});
      template.partial('d', 'This is partial <%= d %>', {layout: 'd'});

      var a = template.process('<%= partial("a") %>', {title: 'Local AA'});
      var b = template.process('<%= partial("b") %>', {title: 'Local BB'});
      var c = template.process('<%= partial("c") %>', {title: 'Local CC'});
      var d = template.process('<%= partial("d") %>', {title: 'Local DD'});

      a.should.equal('last\nBEFORE _C_ BEFORE _B_ BEFORE _A_ This is partial _A_\nAFTER _A_\nAFTER _B_\nAFTER _C_\nlast');
      b.should.equal('last\nBEFORE _C_ BEFORE _B_ This is partial _B_\nAFTER _B_\nAFTER _C_\nlast');
      c.should.equal('last\nBEFORE _C_ This is partial _C_\nAFTER _C_\nlast');

      // No layout is defined for D
      d.should.equal('This is partial _D_');
    });

    xit('should use a global layout if no other layout is defined.', function () {
      var template = new Template({locals: {layout: 'GLOBAL', a: 'A', b: 'B', c: 'C', d: 'D'}});

      template.layout('GLOBAL', '\nGLOBAL\n{{body}}\nGLOBAL');
      template.layout('last', '\nlast\n{{body}}\nlast');
      template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
      template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
      template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'last'});

      template.partial('a', 'This is partial <%= a %>');
      template.partial('b', 'This is partial <%= b %>');
      template.partial('c', 'This is partial <%= c %>');
      template.partial('d', 'This is partial <%= d %>');

      var a = template.process('<%= partial("a") %>', {title: 'Local AA'});
      var b = template.process('<%= partial("b") %>', {title: 'Local BB'});
      var c = template.process('<%= partial("c") %>', {title: 'Local CC'});
      var d = template.process('<%= partial("d") %>', {title: 'Local DD'});

      a.should.equal('GLOBAL\nThis is partial A\nGLOBAL');
      b.should.equal('GLOBAL\nThis is partial B\nGLOBAL');
      c.should.equal('GLOBAL\nThis is partial C\nGLOBAL');
      d.should.equal('GLOBAL\nThis is partial D\nGLOBAL');
    });

    xit('should prefer layouts defined on the locals of a template over global.', function () {
      var template = new Template({locals: {layout: 'GLOBAL', a: 'A', b: 'B', c: 'C', d: 'D'}});

      template.layout('GLOBAL', '\nGLOBAL\n{{body}}\nGLOBAL');
      template.layout('last', '\nlast\n{{body}}\nlast');
      template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
      template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
      template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'last', a: 'A', b: 'B', c: 'C', d: 'D'});

      template.partial('a', 'This is partial <%= a %>', {layout: 'a'});
      template.partial('b', 'This is partial <%= b %>', {layout: 'b'});
      template.partial('c', 'This is partial <%= c %>', {layout: 'c'});
      template.partial('d', 'This is partial <%= d %>', {layout: 'd'});

      var a = template.process('<%= partial("a", {layout: "a"}) %>', {title: 'Local AA'});
      var b = template.process('<%= partial("b", {layout: "a"}) %>', {title: 'Local BB'});
      var c = template.process('<%= partial("c", {layout: "a"}) %>', {title: 'Local CC'});
      var d = template.process('<%= partial("d", {layout: "a"}) %>', {title: 'Local DD'});

      a.should.equal('last\nBEFORE C BEFORE B BEFORE A This is partial A\nAFTER A\nAFTER B\nAFTER C\nlast');
      b.should.equal('last\nBEFORE C BEFORE B BEFORE A This is partial B\nAFTER A\nAFTER B\nAFTER C\nlast');
      c.should.equal('last\nBEFORE C BEFORE B BEFORE A This is partial C\nAFTER A\nAFTER B\nAFTER C\nlast');
      d.should.equal('last\nBEFORE C BEFORE B BEFORE A This is partial D\nAFTER A\nAFTER B\nAFTER C\nlast');
    });

    it('should use layouts defined on `.partial()` locals.', function () {
      var template = new Template({locals: {title: 'GLOBAL'}});

      template.layout('one', '\nLAYOUT ONE {{body}}\nLAYOUT ONE', {layout: 'two'});
      template.layout('two', '\nLAYOUT TWO {{body}}\nLAYOUT TWO', {layout: 'three'});
      template.layout('three', '\nLAYOUT THREE {{body}}\nLAYOUT THREE', {layout: 'last'});
      template.layout('last', '\nlast\n{{body}}\nlast');

      template.partial('a', 'This is partial <%= a %>', {layout: 'one', a: 'AAA'});
      template.partial('b', 'This is partial <%= b %>', {layout: 'two', b: 'BBB'});
      template.partial('c', 'This is partial <%= c %>', {layout: 'three', c: 'CCC'});
      template.partial('d', 'This is partial <%= d %>', {layout: 'last', d: 'DDD'});

      var a = template.process('<%= partial("a") %>', {title: 'Local AA'});
      var b = template.process('<%= partial("b") %>', {title: 'Local BB'});
      var c = template.process('<%= partial("c") %>', {title: 'Local CC'});
      var d = template.process('<%= partial("d") %>', {title: 'Local DD'});

      a.should.equal('last\nLAYOUT THREE LAYOUT TWO LAYOUT ONE This is partial AAA\nLAYOUT ONE\nLAYOUT TWO\nLAYOUT THREE\nlast');
      b.should.equal('last\nLAYOUT THREE LAYOUT TWO This is partial BBB\nLAYOUT TWO\nLAYOUT THREE\nlast');
      c.should.equal('last\nLAYOUT THREE This is partial CCC\nLAYOUT THREE\nlast');
      d.should.equal('last\nThis is partial DDD\nlast');
    });

    it('should use layouts defined on the locals of a template.', function () {
      var template = new Template({locals: {title: 'GLOBAL'}});

      template.layout('one', '\nLAYOUT ONE {{body}}\nLAYOUT ONE', {layout: 'two'});
      template.layout('two', '\nLAYOUT TWO {{body}}\nLAYOUT TWO', {layout: 'three'});
      template.layout('three', '\nLAYOUT THREE {{body}}\nLAYOUT THREE', {layout: 'last'});
      template.layout('last', '\nlast\n{{body}}\nlast');

      template.partial('a', 'This is partial <%= a %>', {a: 'AAA'});
      template.partial('b', 'This is partial <%= b %>', {b: 'BBB'});
      template.partial('c', 'This is partial <%= c %>', {c: 'CCC'});
      template.partial('d', 'This is partial <%= d %>', {d: 'DDD'});

      var a = template.process('<%= partial("a", {layout: "one"}) %>', {title: 'Local AA'});
      var b = template.process('<%= partial("b", {layout: "two"}) %>', {title: 'Local BB'});
      var c = template.process('<%= partial("c", {layout: "three"}) %>', {title: 'Local CC'});
      var d = template.process('<%= partial("d", {layout: "last"}) %>', {title: 'Local DD'});

      a.should.equal('last\nLAYOUT THREE LAYOUT TWO LAYOUT ONE This is partial AAA\nLAYOUT ONE\nLAYOUT TWO\nLAYOUT THREE\nlast');
      b.should.equal('last\nLAYOUT THREE LAYOUT TWO This is partial BBB\nLAYOUT TWO\nLAYOUT THREE\nlast');
      c.should.equal('last\nLAYOUT THREE This is partial CCC\nLAYOUT THREE\nlast');
      d.should.equal('last\nThis is partial DDD\nlast');
    });

    it('should prefer layouts defined on the locals of a template.', function () {
      var template = new Template({locals: {title: 'GLOBAL'}});

      template.layout('foo', 'foo{{body}}foo');
      template.layout('first', '\nLAYOUT FIRST {{body}}\nLAYOUT FIRST', {layout: 'b'});
      template.layout('one', '\nLAYOUT ONE {{body}}\nLAYOUT ONE', {layout: 'two'});
      template.layout('two', '\nLAYOUT TWO {{body}}\nLAYOUT TWO', {layout: 'three'});
      template.layout('three', '\nLAYOUT THREE {{body}}\nLAYOUT THREE', {layout: 'last'});
      template.layout('last', '\nlast\n{{body}}\nlast');

      template.partial('a', 'This is partial <%= a %>', {layout: 'one', a: 'AAA'});
      template.partial('b', 'This is partial <%= b %>', {layout: 'two', b: 'BBB'});
      template.partial('c', 'This is partial <%= c %>', {layout: 'three', c: 'CCC'});
      template.partial('d', 'This is partial <%= d %>', {layout: 'last', d: 'DDD'});

      var a = template.process('<%= partial("a", {layout: "foo"}) %>', {title: 'Local AA'});
      var b = template.process('<%= partial("b", {layout: "foo"}) %>', {title: 'Local BB'});
      var c = template.process('<%= partial("c", {layout: "foo"}) %>', {title: 'Local CC'});
      var d = template.process('<%= partial("d", {layout: "foo"}) %>', {title: 'Local DD'});

      a.should.equal('fooThis is partial AAAfoo');
      b.should.equal('fooThis is partial BBBfoo');
      c.should.equal('fooThis is partial CCCfoo');
      d.should.equal('fooThis is partial DDDfoo');
    });

  });


  describe('layouts context', function () {
    it('should process layouts with local context.', function () {
      var template = new Template();

      template.layouts(['test/fixtures/layouts/*.md'], {
        a: {title: 'LAYOUT A'},
        b: {title: 'LAYOUT B'}
      });

      template.partial('a', 'hello <%= a %>', {layout: 'a'});
      template.partial('b', 'hello <%= b %>', {layout: 'b'});

      var ctx = {a: 'A', b: 'B'};
      var a = template.process('<%= partial("a") %>', ctx);
      var b = template.process('<%= partial("b") %>', ctx);

      assert.equal(typeof a, 'string');
      assert.equal(typeof b, 'string');
      assert.equal(typeof template.layout('a'), 'object');
      assert.equal(typeof template.layout('b'), 'object');

      a.should.equal('LAYOUT A ABOVE\nhello A\nLAYOUT A BELOW');
      b.should.equal('LAYOUT B ABOVE\nhello B\nLAYOUT B BELOW');
    });
  });

  describe('partials layouts', function () {
    it('should use layouts defined when the partial is registered:', function () {
      var template = new Template();

      template.layouts(['test/fixtures/layouts/*.md'], {
        a: {title: 'A', layout: 'b'},
        b: {title: 'B', layout: 'c'},
        c: {title: 'C', layout: 'd'},
        d: {title: 'D', layout: undefined}
      });

      template.partial('a', 'hello <%= a %>', {layout: 'a'});
      template.partial('b', 'hello <%= b %>', {layout: 'b'});

      var ctx = {a: 'A', b: 'B', c: 'C', d: 'D'};


      var a = template.process('hello <%= a %>', {layout: 'a', a: 'AAA'});
      var b = template.process('hello <%= b %>', {layout: 'b', b: 'BBB'});
      var c = template.process('hello <%= c %>', {layout: 'c', c: 'CCC'});
      var d = template.process('hello <%= d %>', {layout: 'd', d: 'DDD'});

      a.should.equal('A ABOVE\nhello AAA\nA BELOW');
      b.should.equal('B ABOVE\nhello BBB\nB BELOW');
      c.should.equal('C ABOVE\nhello CCC\nC BELOW');
      d.should.equal('D ABOVE\nhello DDD\nD BELOW');

      assert.equal(typeof a, 'string');
      assert.equal(typeof b, 'string');
      assert.equal(typeof template.layout('a'), 'object');
      assert.equal(typeof template.layout('b'), 'object');
    });
  });
});
