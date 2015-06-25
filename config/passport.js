'use strict';

/**
 * Module dependencies.
 */
var passport 	= require('passport'),
		User 			= require('mongoose').model('User'),
		path 			= require('path'),
		config 		= require('./config');

/**
 * Module init function.
 */
module.exports = function(server) {
	// Serialize sessions
	/*
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// Deserialize sessions
	passport.deserializeUser(function(id, done) {
		User.findOne({
			_id: id
		}, '-salt -password', function(err, user) {
			done(err, user);
		});
	});
*/
/*
	server.register(Basic, function(err) {
		server.auth.strategy('local', 'basic', {
			validateFunc: require('./strategies/local.js')
		});
	});*/

var fb = require('./strategies/facebook');

	server.auth.strategy(fb.strategyName, 'bell', fb.strategyConfig);

	// Initialize strategies
	// config.getGlobbedFiles('./config/strategies/**/*.js').forEach(function(strategy) {
	// 	require(path.resolve(strategy))();
	// });
};
