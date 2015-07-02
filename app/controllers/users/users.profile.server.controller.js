'use strict';

/**
 * Module dependencies.
 */
var _ 						= require('lodash'),
		Boom 					= require('boom'),
		Errorhandler 	= require('../errors.server.controller.js'),
		Mongoose 			= require('mongoose'),
		User 					= Mongoose.model('User');

/**
 * Update user details
 */
exports.update = function (request, reply) {

	// Init Variables
	var reqUser = request.auth.credentials;
	var message = null;

	// For security measurement we remove the roles from the request.body object
	delete request.payload.roles;


	User.findOne({id: reqUser.id}, function (err, user) {

		if (user) {
			// Merge existing user
			user = _.extend(user, request.payload);
			user.updated = Date.now();
			user.displayName = user.firstName + ' ' + user.lastName;

			user.save(function (err) {

				if (err) {
					return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));

				} else {
					request.session.set(request.server.app.sessionName, user);
					reply(user);

				}
			});
		} else {
			reply(Boom.badRequest('User is not signed in'));
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
