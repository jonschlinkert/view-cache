/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

var should = require('should');
var Template = require('..');


describe('template set:', function () {
  describe('.set():', function () {
    describe('when template are defined as objects:', function () {
      it('when template are defined as objects:', function () {
        var template = new Template();
        template.layout('base', 'base!\n{{body}}\nbase!');
        template.layout('a', 'A above\n{{body}}\nA below', {layout: 'b'});
        template.layout('b', 'B above\n{{body}}\nB below', {layout: 'c'});
        template.layout('c', 'C above\n{{body}}\nC below', {layout: 'base'});

        var ctx = {
          title: 'Page!',
          layout: 'a'
        };

        var actual = template.process('I\'m a <%= title %>', ctx);
        var expected = [
          'base!',
          'C above',
          'B above',
          'A above',
          'I\'m a <%= title %>!', // should not be compiled
          'A below',
          'B below',
          'C below',
          'base!'
        ].join('\n');
        actual.should.eql(expected);
      });
    });
  });
});