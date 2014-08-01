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


describe('template layout delimiters', function () {
  it('should use custom layout delimiters:', function () {
    var template = new Template({
      layoutDelims: ['{%', '%}'],
      layoutTag: 'foo'
    });
    var ctx = {
      a: 'FIRST',
      b: 'SECOND',
      c: 'THIRD',
      d: 'FOURTH',
      layout: 'a'
    };

    template.layout('base', '\nbase\n{% foo %}\nbase');
    template.layout('a', '\nBEFORE <%= a %> {% foo %}\nAFTER <%= a %>', {layout: 'b'});
    template.layout('b', '\nBEFORE <%= b %> {% foo %}\nAFTER <%= b %>', {layout: 'c'});
    template.layout('c', '\nBEFORE <%= c %> {% foo %}\nAFTER <%= c %>', {layout: 'base'});


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

  it('layout delimiters should not be space sensitive:', function () {
    var template = new Template({
      layoutDelims: ['{%', '%}'],
      layoutTag: 'foo'
    });

    template.layout('base', '\nbase\n{% foo %}\nbase');
    template.layout('a', '\nBEFORE <%= a %> {% foo %}\nAFTER <%= a %>', {layout: 'b'});
    template.layout('b', '\nBEFORE <%= b %> {% foo %}\nAFTER <%= b %>', {layout: 'c'});
    template.layout('c', '\nBEFORE <%= c %> {% foo %}\nAFTER <%= c %>', {layout: 'base'});

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
