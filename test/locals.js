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


describe('template context:', function () {
  describe('when `locals` is defined on the options:', function () {
    var template = new Template({
      locals: {
        a: 'FIRST',
        b: 'SECOND',
        c: 'THIRD',
        d: 'FOURTH',
        layout: 'a'
      }
    });

    it('should pass the context to templates:', function () {
      template.layout('base', '\nbase\n{{body}}\nbase');
      template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
      template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
      template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'base'});

      template.partial('a', 'This is partial <%= a %>');
      template.partial('b', 'This is partial <%= b %>');
      template.partial('c', 'This is partial <%= c %>');
      template.partial('d', 'This is partial <%= d %>');

      var a = template.process('<%= partial("a") %>');
      var b = template.process('<%= partial("b") %>');
      var c = template.process('<%= partial("c") %>');
      var d = template.process('<%= partial("d") %>');

      a.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FIRST\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nbase');
      b.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial SECOND\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nbase');
      c.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial THIRD\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nbase');
      d.should.equal('\nbase\n\nBEFORE THIRD \nBEFORE SECOND \nBEFORE FIRST This is partial FOURTH\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nbase');
    });
  });
});
