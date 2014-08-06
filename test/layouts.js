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


describe('template layouts', function () {
  describe('.layout():', function () {
    it('should add layouts defined as  strings to `cache.layouts`.', function () {
      var template = new Template();
      template.layout('a', 'This is layout <%= a %>');
      template.layout('b', 'This is layout <%= b %>');

      var cache = Object.keys(template.cache.layouts);
      cache.should.have.length(2);
    });

    it('should add layouts defined as objects to `cache.layouts`.', function () {
      var template = new Template();
      template.layout({a: {content: 'This is layout <%= a %>', locals: {a: 'b'}}});
      template.layout({b: {content: 'This is layout <%= b %>', locals: {a: 'd'}}});

      var layouts = template.cache.layouts;
      layouts.should.have.property('locals');
      layouts.should.have.property('a');
      layouts.should.have.property('b');
      Object.keys(layouts).should.have.length(3);
    });
  });

  describe('.layouts():', function () {
    it('should add multiple layouts to `cache.layouts`.', function () {
      var template = new Template();
      template.layouts({
        a: 'This is layout <%= a %>',
        b: 'This is layout <%= b %>',
        c: 'This is layout <%= c %>',
        d: 'This is layout <%= d %>'
      });
      var cache = Object.keys(template.cache.layouts);
      cache.should.have.length(4);
    });

    it('should process layouts defined as objects when the `<%= partial() %>` tag is used.', function () {
      var template = new Template();
      template.layout({last: {content: '\nlast\n{{body}}\nlast'}});
      template.partials({a: {layout: 'last', content: 'This is partial <%= a %>'}});
      template.partials({
        a: 'This is partial <%= a %>',
        b: 'This is partial <%= b %>'
      });
      var actual = template.process('\n<%= partial("a") %>', {layout: 'last', a: 'A'})
      actual.should.eql('\nlast\n\nThis is partial A\nlast');
    });

    it('should process layouts defined as strings when the `<%= partial() %>` tag is used.', function () {
      var template = new Template();
      template.layout('last', '\nlast\n{{body}}\nlast');
      template.partial('a', 'This is partial <%= a %>');
      var actual = template.process('\n<%= partial("a") %>', {layout: 'last', a: 'A'})
      actual.should.eql('\nlast\n\nThis is partial A\nlast');
    });

    it('should stack layouts when the `<%= partial() %>` tag is used.', function () {
      var template = new Template();
      template.layout('last', '\nlast\n{{body}}\nlast', {layout: 'a'});
      template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});

      template.partial('a', 'This is partial <%= a %>');

      var actual = template.process('\n<%= partial("a") %>', {layout: 'last', a: 'A'})
      actual.should.eql('\nBEFORE A \nlast\n\nThis is partial A\nlast\nAFTER A');
    });

    it('should register a partial as a layout..', function () {
      var template = new Template();
      template.layout('last', '\nlast\n{{body}}\nlast', {layout: 'a'});
      template.partial('foo', 'This is partial <%= a %>\n{{body}}');

      template.layout('a', template.partial('foo'), {layout: 'b'});
      template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>');


      var actual = template.process('\n<%= partial("a") %>', {layout: 'last', a: 'A', b: 'B'})
      actual.should.eql('\nBEFORE B This is partial A\n\nlast\n\n\nlast\nAFTER B');
    });


    it('should process complex nested layouts when the `<%= partial() %>` tag is used.', function () {
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

  });
});
