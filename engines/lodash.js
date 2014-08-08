'use strict';

/**
 * Module dependencies.
 */

var _ = require('lodash');


/**
 * lodash renderer
 */

var engine = {};

engine.render = function lodashRender(str, options) {
  options = options || {};

  try {
    var settings = options.settings || {};
    delete options.settings;

    settings.imports = settings.imports || settings.helpers;
    return _.template(str, options, settings);
  } catch (err) {
    return err;
  }
};


module.exports = engine;