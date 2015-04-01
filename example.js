'use strict';

var fs = require('fs');
var util = require('util');
var Views = require('./');
var app = new Views();

// app.createType('renderable');
// app.createType('layout');
// app.createType('index');
// app.createType('partial');

app.loader('file', function (fp) {
  return {path: fp};
});

app.loader('read', function (file) {
  file.content = fs.readFileSync(file.path, 'utf8');
  return file;
});

app.loader('orig', function (file) {
  file.orig = file.content;
  return file;
});

app.loader('data', function (file) {
  file.data = file.data || {};
  return file;
});

app.loader('locals', function (file) {
  file.locals = file.locals || {};
  return file;
});

app.loader('parse', function (file) {
  file.data = JSON.parse(file.content);
  return file;
});

app.create('partial', {isPartial: true}, ['data', 'locals']);
app.create('page', {type: 'renderable'});
app.create('cactus', {type: ['partial', 'renderable']});
app.create('layout');


app.partial('fixtures/a.txt', ['file', 'read', 'orig', function foo(file) {
  file.foo = 'bar';
  return file;
}], function bar(file) {
  file.bar = 'baz';
  return file;
});

app.partial('fixtures/b.txt', ['file', 'read', 'orig', function foo(file) {
  file.foo = 'bar';
  return file;
}], function bar(file) {
  file.bar = 'baz';
  return file;
});

app.page('fixtures/page.json', ['file', 'read', 'parse']);
app.page('aaa', {content: 'this is content'});
app.page('bbb', {content: 'this is content'});
app.page('ccc', {content: 'this is content'});

// app.create('include', {load: 'async'}, function (file, next) {
//   file.data = file.data || {};
//   next();
// });

// app.include('TODO.md', function (fp, next) {
//   file = {path: fp};
//   next();
// });

// app.create('blocks', function () {
//   return app._loader.apply(app, arguments);
// });

// require('./app').sync(app);
// require('./app').async(app, function (err) {
//   console.log(err)
// });

console.log(util.inspect(app, null, 10));
