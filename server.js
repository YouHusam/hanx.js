'use strict';
/**
 * Module dependencies.
 */
var Init    = require('./config/init')(),
    Config  = require('./config/config'),
    Chalk   = require('chalk');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Init the hapi application
var server = require('./config/hapi')();

// Start the server when plugins are loaded

server.on('pluginsLoaded', function(){

  server.start(function(){
    // Logging initialization
    console.log('--');
    console.log(Chalk.green(Config.app.title + ' application started'));
    console.log(Chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
    console.log(Chalk.green('Port:\t\t\t\t' + Config.port));
    console.log(Chalk.green('Database:\t\t\t' + Config.db.pg.host + ':' +
      Config.db.pg.port));
    if (process.env.NODE_ENV === 'secure') {
      console.log(Chalk.green('HTTPs:\t\t\t\ton'));
    }
    console.log('--');
  });
});

// Expose server
exports = module.exports = server;


