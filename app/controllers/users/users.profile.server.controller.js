'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	Boom = require('boom'),
	Errorhandler = require('../errors.server.controller.js'),
	Mongoose = require('mongoose'),
	Passport = require('passport'),
	User = Mongoose.model('User');

/**
 * Update user details
 */
exports.update = function(request, reply) {

	// Init Variables
	var user = request.payload.user;
	var message = null;

	// For security measurement we remove the roles from the request.body object
	delete request.payload.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, request.payload);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {

			if (err) {
				return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));
			} else {
				request.login(user, function(err) {
					if (err) {
						reply(Boom.badRequest(err));
					} else {
						reply(user);
					}
				});
			}
		});
	} else {
		reply(Boom.badRequest('User is not signed in'));
	}
};

/**
 * Send User
 */
exports.me = function(request, reply) {
	console.log(request.auth);
 var user = request.auth.credentials;
	reply({user: user});
};
