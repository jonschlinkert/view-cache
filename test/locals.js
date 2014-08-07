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


describe('template locals:', function () {
  // describe('when a locals are defined on the constructor.', function () {
  //   var template = new Template({
  //     locals: {
  //       a: 'FIRST',
  //       b: 'SECOND',
  //       c: 'THIRD',
  //       d: 'FOURTH'
  //     }
  //   });

  //   it('should pass the context to templates:', function () {
  //     template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
  //     template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
  //     template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'last'});
  //     template.layout('last', 'last\n{{body}}\nlast');

  //     template.partial('a', 'This is partial <%= a %>');
  //     template.partial('b', 'This is partial <%= b %>');
  //     template.partial('c', 'This is partial <%= c %>');
  //     template.partial('d', 'This is partial <%= d %>');

  //     var a = template.process('<%= partial("a") %>', {layout: 'a'});
  //     var b = template.process('<%= partial("b") %>', {layout: 'b'});
  //     var c = template.process('<%= partial("c") %>', {layout: 'c'});
  //     var d = template.process('<%= partial("d") %>', {layout: 'last'});

  //     a.should.equal('last\nBEFORE THIRD BEFORE SECOND BEFORE FIRST This is partial FIRST\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
  //     b.should.equal('last\nBEFORE THIRD BEFORE SECOND This is partial SECOND\nAFTER SECOND\nAFTER THIRD\nlast');
  //     c.should.equal('last\nBEFORE THIRD This is partial THIRD\nAFTER THIRD\nlast');
  //     d.should.equal('last\nThis is partial FOURTH\nlast');
  //   });
  // });

  // describe('when a layout is defined in `locals` on the options:', function () {
  //   var template = new Template({
  //     locals: {
  //       a: 'FIRST',
  //       b: 'SECOND',
  //       c: 'THIRD',
  //       d: 'FOURTH'
  //     }
  //   });

  //   it('should pass the context to templates:', function () {
  //     template.layout('a', '\nBEFORE <%= a %> {{body}}\nAFTER <%= a %>', {layout: 'b'});
  //     template.layout('b', '\nBEFORE <%= b %> {{body}}\nAFTER <%= b %>', {layout: 'c'});
  //     template.layout('c', '\nBEFORE <%= c %> {{body}}\nAFTER <%= c %>', {layout: 'last'});
  //     template.layout('last', 'last\n{{body}}\nlast');

  //     template.partial('a', 'This is partial <%= a %>');
  //     template.partial('b', 'This is partial <%= b %>');
  //     template.partial('c', 'This is partial <%= c %>');
  //     template.partial('d', 'This is partial <%= d %>');

  //     var a = template.process('<%= partial("a") %>', {layout: 'a'});
  //     var b = template.process('<%= partial("b") %>', {layout: 'b'});
  //     var c = template.process('<%= partial("c") %>', {layout: 'c'});
  //     var d = template.process('<%= partial("d") %>', {layout: 'last'});

  //     a.should.equal('last\nBEFORE THIRD BEFORE SECOND BEFORE FIRST This is partial FIRST\nAFTER FIRST\nAFTER SECOND\nAFTER THIRD\nlast');
  //     b.should.equal('last\nBEFORE THIRD BEFORE SECOND This is partial SECOND\nAFTER SECOND\nAFTER THIRD\nlast');
  //     c.should.equal('last\nBEFORE THIRD This is partial THIRD\nAFTER THIRD\nlast');
  //     d.should.equal('last\nThis is partial FOURTH\nlast');
  //   });
  // });


  describe('when locals are passed directly to the process method.', function () {
    it('should pass the context to templates:', function () {
      var template = new Template({
        locals: {
          title: 'GLOBAL',
          layout: 'a'
        }
      });

      template.layout('a', '\nBEFORE <%= title %> {{body}}\nAFTER <%= title %>', {title: 'LAYOUT A', layout: 'b'});
      template.layout('b', '\nBEFORE <%= title %> {{body}}\nAFTER <%= title %>', {title: 'LAYOUT B', layout: 'c'});
      template.layout('c', '\nBEFORE <%= title %> {{body}}\nAFTER <%= title %>', {title: 'LAYOUT C', layout: 'last'});
      template.layout('last', 'last\n{{body}}\nlast');

      template.partial('alpha', 'This is partial <%= title %>', {title: 'AA'});
      template.partial('beta', 'This is partial <%= title %>', {title: 'BB'});
      template.partial('gamma', 'This is partial <%= title %>', {title: 'CC'});
      template.partial('omega', 'This is partial <%= title %>', {title: 'DD'});

      var a = template.process('<%= partial("alpha") %>');
      var b = template.process('<%= partial("beta") %>');
      var c = template.process('<%= partial("gamma") %>');
      var d = template.process('<%= partial("omega") %>');

      a.should.equal('last\nBEFORE CC BEFORE BB BEFORE AA This is partial AA\nAFTER AA\nAFTER BB\nAFTER CC\nlast');
      b.should.equal('last\nBEFORE CC BEFORE BB BEFORE AA This is partial BB\nAFTER AA\nAFTER BB\nAFTER CC\nlast');
      c.should.equal('last\nBEFORE CC BEFORE BB BEFORE AA This is partial CC\nAFTER AA\nAFTER BB\nAFTER CC\nlast');
      d.should.equal('last\nBEFORE CC BEFORE BB BEFORE AA This is partial DD\nAFTER AA\nAFTER BB\nAFTER CC\nlast');
    });
  });

});
