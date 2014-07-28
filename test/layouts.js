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
      template.layout({a: {content: 'This is layout <%= a %>'}});
      template.layout({b: {content: 'This is layout <%= b %>'}});

      var cache = Object.keys(template.cache.layouts);
      cache.should.have.length(2);
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
      template.layout({base: {content: '\nbase\n{{body}}\nbase'}});
      // template.partials({a: {layout: 'base', content: 'This is partial <%= a %>'}});
      template.partials({
        a: 'This is partial <%= a %>',
        b: 'This is partial <%= b %>'
      });
      var actual = template.process('\n<%= partial("a") %>', {layout: 'base', a: 'A'})
      actual.should.eql('\nbase\n\nThis is partial A\nbase');
    });

    it('should process layouts defined as strings when the `<%= partial() %>` tag is used.', function () {
      var template = new Template();
      template.layout('base', '\nbase\n{{body}}\nbase');
      template.partial('a', 'This is partial <%= a %>');
      var actual = template.process('\n<%= partial("a") %>', {layout: 'base', a: 'A'})
      actual.should.eql('\nbase\n\nThis is partial A\nbase');
    });

    it('should stack layouts when the `<%= partial() %>` tag is used.', function () {
      var template = new Template();
      template.layout('base', '\nbase\n{{body}}\nbase', {layout: 'a'});
      template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});

      template.partial('a', 'This is partial <%= a %>');

      var actual = template.process('\n<%= partial("a") %>', {layout: 'base', a: 'A'})
      actual.should.eql('\nBEFORE A \nbase\n\nThis is partial A\nbase\nAFTER A');
    });

    it('should register a partial as a layout..', function () {
      var template = new Template();
      template.layout('base', '\nbase\n{{body}}\nbase', {layout: 'a'});
      template.partial('foo', 'This is partial <%= a %>\n{{body}}');

      template.layout('a', template.partial('foo'), {layout: 'b'});
      template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>');


      var actual = template.process('\n<%= partial("a") %>', {layout: 'base', a: 'A', b: 'B'})
      actual.should.eql('\nBEFORE B This is partial A\n\nbase\n\n\nbase\nAFTER B');
    });


    it('should process complex nested layouts when the `<%= partial() %>` tag is used.', function () {
      var template = new Template();

      template.layout('base', '\nbase\n{{body}}\nbase');
      template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
      template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
      template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'base'});

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

      a.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FIRST\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nbase');
      b.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial SECOND\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nbase');
      c.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial THIRD\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nbase');
      d.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FOURTH\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nbase');
    });

  });
});

