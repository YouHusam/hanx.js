'use strict';

/**
 * Module dependencies.
 */
var _ 						= require('lodash'),
		Boom 					= require('boom'),
		Errorhandler 	= require('../errors.server.controller.js');

/**
 * Update user details
 */
exports.update = function (request, reply) {

	var User = request.collections.user;

	// Init Variables
	var reqUser = request.auth.credentials;
	var message = null;

	// For security measurement we remove the roles from the request.paylad object
	delete request.payload.roles;
	delete request.payload.id;

	User.update(reqUser, request.payload).exec(function (err, user) {
		if (err) {
			return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));

		} else {
			var authedUser = require('./users.authentication.server.controller.js')
					.cleanUser(user[0]);

			request.session.set(request.server.app.sessionName, authedUser);
			return reply(authedUser);
		}
	});
};

/**
 * Send User
 */
exports.me = function (request, reply) {

	var user = request.auth.credentials;
		reply({user: user});
};
