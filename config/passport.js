'use strict';

/**
 * Module dependencies.
 */
var path 			= require('path'),
		config 		= require('./config');

/**
 * Module init function.
 */
module.exports = function(server) {

var session = require('./strategies/session');
session.setServer(server);
server.auth.strategy('session', 'yar-session', session.strategyConfig);

var fb = require('./strategies/facebook');

	server.auth.strategy(fb.strategyName, 'bell', fb.strategyConfig);

	// Initialize strategies
	// config.getGlobbedFiles('./config/strategies/**/*.js').forEach(function(strategy) {
	// 	require(path.resolve(strategy))();
	// });
};
