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
      template.layout('b', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'last'});
      template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});

      template.partial('a', 'This is partial <%= a %>', {layout: 'a', a: 'A'});

      var actual = template.process('\n<%= partial("a") %>', {a: 'A'})
      actual.should.eql('\nBEFORE A \nlast\n\nThis is partial A\nlast\nAFTER A');
    });

    // xit('should stack layouts when the `<%= partial() %>` tag is used.', function () {
    //   var template = new Template();
    //   template.layout('last', '\nlast\n{{body}}\nlast', {layout: 'a'});
    //   template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'last'});

    //   template.partial('a', 'This is partial <%= a %>');

    //   var actual = template.process('\n<%= partial("a") %>', {layout: 'a', a: 'A'})
    //   actual.should.eql('\nBEFORE A \nlast\n\nThis is partial A\nlast\nAFTER A');
    // });

    // xit('should register a partial as a layout..', function () {
    //   var template = new Template();
    //   template.layout('last', '\nlast\n{{body}}\nlast', {layout: 'a'});
    //   template.partial('foo', 'This is partial <%= a %>\n{{body}}');

    //   template.layout('a', template.partial('foo'), {layout: 'b'});
    //   template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>');


    //   var actual = template.process('\n<%= partial("a") %>', {layout: 'last', a: 'A', b: 'B'})
    //   actual.should.eql('\nBEFORE B This is partial A\n\nlast\n\n\nlast\nAFTER B');
    // });


    // xit('should process complex nested layouts when the `<%= partial() %>` tag is used.', function () {
    //   var template = new Template();

    //   template.layout('last', '\nlast\n{{body}}\nlast');
    //   template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
    //   template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
    //   template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'last'});

    //   var ctx = {
    //     a: 'FIRST',
    //     b: 'SECOND',
    //     c: 'THIRD',
    //     d: 'FOURTH',
    //     layout: 'a'
    //   };

    //   template.partial('a', 'This is partial <%= a %>');
    //   template.partial('b', 'This is partial <%= b %>');
    //   template.partials({
    //     c: 'This is partial <%= c %>',
    //     d: 'This is partial <%= d %>'
    //   });

    //   var a = template.process('<%= partial("a") %>', ctx);
    //   var b = template.process('<%= partial("b") %>', ctx);
    //   var c = template.process('<%= partial("c") %>', ctx);
    //   var d = template.process('<%= partial("d") %>', ctx);

    //   a.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FIRST\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
    //   b.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial SECOND\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
    //   c.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial THIRD\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
    //   d.should.equal('\nlast\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FOURTH\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
    // });

    // xit('should prefer layouts defined on the locals over a default layout.', function () {
    //   var template = new Template({locals: {layout: 'GLOBAL'}});

    //   template.layout('GLOBAL', '\nGLOBAL\n{{body}}\nGLOBAL');
    //   template.layout('last', '\nlast\n{{body}}\nlast');
    //   template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
    //   template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
    //   template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'last'});

    //   template.partial('a', 'This is partial <%= a %>', {layout: 'a'});
    //   template.partial('b', 'This is partial <%= b %>', {layout: 'b'});
    //   template.partial('c', 'This is partial <%= c %>', {layout: 'c'});
    //   template.partial('d', 'This is partial <%= d %>', {layout: 'd'});

    //   var a = template.process('<%= partial("a") %>', {title: 'Local AA'});
    //   var b = template.process('<%= partial("b") %>', {title: 'Local BB'});
    //   var c = template.process('<%= partial("c") %>', {title: 'Local CC'});
    //   var d = template.process('<%= partial("d") %>', {title: 'Local DD'});

    //   a.should.equal('This is partial AA');
    //   b.should.equal('This is partial BB');
    //   c.should.equal('This is partial CC');
    //   d.should.equal('This is partial DD');
    // });

    // xit('should prefer layouts defined on the locals of a template over global.', function () {
    //   var template = new Template({locals: {layout: 'GLOBAL'}});

    //   template.layout('GLOBAL', '\nGLOBAL\n{{body}}\nGLOBAL');
    //   template.layout('last', '\nlast\n{{body}}\nlast');
    //   template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
    //   template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
    //   template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'last'});

    //   template.partial('a', 'This is partial <%= a %>', {layout: 'a'});
    //   template.partial('b', 'This is partial <%= b %>', {layout: 'b'});
    //   template.partial('c', 'This is partial <%= c %>', {layout: 'c'});
    //   template.partial('d', 'This is partial <%= d %>', {layout: 'd'});

    //   var a = template.process('<%= partial("a", {layout: "a"}) %>', {title: 'Local AA'});
    //   var b = template.process('<%= partial("b", {layout: "a"}) %>', {title: 'Local BB'});
    //   var c = template.process('<%= partial("c", {layout: "a"}) %>', {title: 'Local CC'});
    //   var d = template.process('<%= partial("d", {layout: "a"}) %>', {title: 'Local DD'});

    //   a.should.equal('This is partial AA');
    //   b.should.equal('This is partial BB');
    //   c.should.equal('This is partial CC');
    //   d.should.equal('This is partial DD');
    // });

    // xit('should use layouts defined on the locals of a template.', function () {
    //   var template = new Template({locals: {title: 'GLOBAL'}});

    //   template.layout('GLOBAL', '\nGLOBAL\n{{body}}\nGLOBAL');
    //   template.layout('last', '\nlast\n{{body}}\nlast');
    //   template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
    //   template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
    //   template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'last'});

    //   template.partial('a', 'This is partial <%= a %>', {layout: 'a'});
    //   template.partial('b', 'This is partial <%= b %>', {layout: 'b'});
    //   template.partial('c', 'This is partial <%= c %>', {layout: 'c'});
    //   template.partial('d', 'This is partial <%= d %>', {layout: 'd'});

    //   var a = template.process('<%= partial("a", {layout: "a"}) %>', {title: 'Local AA'});
    //   var b = template.process('<%= partial("b", {layout: "a"}) %>', {title: 'Local BB'});
    //   var c = template.process('<%= partial("c", {layout: "a"}) %>', {title: 'Local CC'});
    //   var d = template.process('<%= partial("d", {layout: "a"}) %>', {title: 'Local DD'});

    //   a.should.equal('This is partial AA');
    //   b.should.equal('This is partial BB');
    //   c.should.equal('This is partial CC');
    //   d.should.equal('This is partial DD');
    // });
  });


  // describe('layouts context', function () {
  //   it('should process layouts with the given context.', function () {
  //     var template = new Template();

  //     template.layouts(['test/fixtures/*.md']);
  //     template.partial('a', 'hello <%= a %>');
  //     template.partial('b', 'hello <%= b %>');

  //     var ctx = {a: 'A', b: 'B'};
  //     var a = template.process('<%= partial("a") %>', ctx);
  //     var b = template.process('<%= partial("b") %>', ctx);

  //     assert.equal(typeof a, 'string');
  //     assert.equal(typeof b, 'string');
  //     assert.equal(typeof template.layout('a'), 'object');
  //     assert.equal(typeof template.layout('b'), 'object');

  //     a.should.equal('hello A');
  //     b.should.equal('hello B');
  //   });
  // });

  // describe('partials layouts', function () {
  //   it('should use layouts define when the partial is registered:', function () {
  //     var template = new Template();

  //     template.layouts(['test/fixtures/layouts/*.md'], {
  //       a: {title: 'A', layout: 'b'},
  //       b: {title: 'B', layout: 'c'},
  //       c: {title: 'C', layout: 'd'},
  //       d: {title: 'D', layout: undefined}
  //     });

  //     template.partial('a', 'hello <%= a %>', {layout: 'a'});
  //     template.partial('b', 'hello <%= b %>', {layout: 'b'});

  //     var ctx = {a: 'A', b: 'B', c: 'C', d: 'D'};

  //     var a = template.render('a', ctx);
  //     var b = template.render('b', ctx);

  //     template.partial('c', 'hello <%= c %>', {layout: 'a', c: 'CCC'});
  //     template.partial('d', 'hello <%= d %>', {layout: 'b', d: 'DDD'});

  //     var c = template.render('c', ctx);
  //     var d = template.render('d', ctx);

  //     c.should.equal('A ABOVE\nhello CCC\nA BELOW');
  //     d.should.equal('B ABOVE\nhello DDD\nB BELOW');

  //     assert.equal(typeof a, 'string');
  //     assert.equal(typeof b, 'string');
  //     assert.equal(typeof template.layout('a'), 'object');
  //     assert.equal(typeof template.layout('b'), 'object');

  //     a.should.equal('A ABOVE\nhello A\nA BELOW');
  //     b.should.equal('B ABOVE\nhello B\nB BELOW');
  //   });
  // });
});
