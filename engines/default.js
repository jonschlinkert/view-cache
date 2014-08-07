'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash');


/**
 * lodash renderer
 */

var engine = {};

engine.render = function noopRender(str, options, callback) {
  options = options || {};

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (!callback) {
    callback = function (err, content) {
      if (err) {
        throw new Error(err);
      }
      return content;
    };
  }

  try {
    var filepath = options.filename;
    var settings = options.settings || {};
    delete options.settings;
    settings.imports = settings.imports || settings.helpers;
    var rendered = _.template(str, options, settings);
    return callback(null, rendered);
  } catch (err) {
    return callback(err);
  }
};


module.exports = engine;