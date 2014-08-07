
var _ = require('lodash');

var foo = _.runInContext();

console.log(foo.template('<%= foo.a %>', {foo:{a: 'b'}}))