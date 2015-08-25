'use strict';

/**
 * Module dependencies.
 */

var Config = require('./config');

/**
 * Module init function.
 */
module.exports = {

  getLogReporters: function () {

    var reporters = [

    ];

    if ('console' in Config.log.options) {
      reporters.push({
          reporter: require('good-console'),
          events: { response: Config.log.options.events }
      });
    }

    if ('stream' in Config.log.options) {
      reporters.push({
        reporter: require('good-file'),
        events: { response: '*' },
        config: process.cwd() + '/' + Config.log.options.stream
      });
    }

    return reporters;
  }

};
