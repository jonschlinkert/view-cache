
exports.sync = function (engine) {
  engine.blocks('test/fixtures/a.md', {a: 'b'});
  engine.includes('test/fixtures/a.md', {a: 'b'});
  engine.layouts('test/fixtures/a.md', {a: 'b'});
  engine.pages('foo1.md', 'This is content', {name: 'Jon Schlinkert'});
  engine.partials({'foo/bar.md': {content: 'this is content.', data: {a: 'a'}}});
};

exports.async = function (engine) {
  engine.blocks('test/fixtures/a.md', {a: 'b'});
  engine.layouts('test/fixtures/a.md', {a: 'b'});
  engine.pages('foo1.md', 'This is content', {name: 'Jon Schlinkert'});
  engine.partials({'foo/bar.md': {content: 'this is content.', data: {a: 'a'}}});
};

exports.promise = function (engine, next) {
  engine.blocks('test/fixtures/a.md', {a: 'b'});
  engine.layouts('test/fixtures/a.md', {a: 'b'});
  engine.pages('foo1.md', 'This is content', {name: 'Jon Schlinkert'});
  engine.partials({'foo/bar.md': {content: 'this is content.', data: {a: 'a'}}});
};

// engine.layouts('test/fixtures/a.md', {a: 'b'});
// engine.pages('foo1.md', 'This is content', {name: 'Jon Schlinkert'});
// engine.partials({'foo/bar.md': {content: 'this is content.', data: {a: 'a'}}});
// engine.layouts('layouts/*.txt', 'flflflfl', {name: 'Brian Woodward'});
// engine.layouts('layouts/*.txt', {name: 'Brian Woodward'});
// engine.pages('abc.md', 'This is content.', {name: 'Jon Schlinkert'});
// engine.pages(['test/fixtures/one/*.md'], {a: 'b'});
// engine.pages({'bar1.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}});
// engine.pages({'baz.md': {path: 'a/b/c.md', name: 'Jon Schlinkert'}}, {go: true});
// engine.pages({'test/fixtures/a.txt': {path: 'a.md', a: 'b'}});
// engine.pages({path: 'test/fixtures/three/a.md', foo: 'b'});
// engine.pages('fixtures/two/*.md', {name: 'Brian Woodward'});
// engine.pages('pages/a.md', 'This is content.', {name: 'Jon Schlinkert'});
// engine.pages('test/fixtures/*.md', 'flflflfl', {name: 'Brian Woodward'});
// engine.pages('test/fixtures/a.md', {foo: 'bar'});
// engine.pages('test/fixtures/three/*.md', {name: 'Brian Woodward'});
// engine.pages(['test/fixtures/a.txt'], {name: 'Brian Woodward'});
// engine.partials({path: 'one/two.md', content: 'this is content.', data: {b: 'b'}});
