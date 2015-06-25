'use strict';

/**
 * Module dependencies.
 */
var _ 					= require('lodash'),
	 Boom 				= require('boom'),
	 Errorhandler = require('../errors.server.controller'),
	 Mongoose 		= require('mongoose'),
	 Passport 		= require('passport'),
	 User 				= Mongoose.model('User');

/**
 * Signup
 */
exports.signup = function(request, reply) {

	// For security measurement we remove the roles from the request.body object
	delete request.payload.roles;

	// Init Variables
	var user = new User(request.payload);
	var message = null;

	// Add missing user fields
	user.provider = 'local';
	user.displayName = user.firstName + ' ' + user.lastName;

	// Then save the user
	user.save(function(err) {
		if (err) {
			return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));
		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			request.login(user, function(err) {
				if (err) {
					reply(Boom.badRequest(err));
				} else {
					reply(user);
				}
			});
		}
	});
};

/**
 * Signin after passport authentication
 */
exports.signin = function(request, reply) {

	var user = request.auth.credentials;
	if (!user) {

		var username = request.payload.username;
		var password = request.payload.password;

		User.findOne({
			username: username
		}, function(err, user) {

			if (err) {
				return reply(Boom.unauthorized());
			}
			if (!user) {
				return reply(Boom.unauthorized());
			}
			if (!user.authenticate(password)) {
				return reply(Boom.unauthorized());
			}

			request.session.set('login', request.auth.credentials);
			return reply.continue({credentials: user});
		});

	} else {
		// Remove sensitive data before login
		user.password = undefined;
		user.salt = undefined;

				reply(user);
	}

};

/**
 * Signout
 */
exports.signout = function(request, reply) {

	request.session.clear('login');
	reply.redirect('/');
};

/**
 * OAuth callback
 */
exports.oauthCallback = function(request, reply) {

	if (!request.auth.isAuthenticated) {
		return reply.redirect('/#!/signin');
	}
	request.session.set('login', request.auth.credentials);
	return reply.redirect('/');
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function(request, providerUserProfile, done) {

	if (!request.session.get('login')) {
		// Define a search query fields
		var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
		var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

		// Define main provider search query
		var mainProviderSearchQuery = {};
		mainProviderSearchQuery.provider = providerUserProfile.provider;
		mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define additional provider search query
		var additionalProviderSearchQuery = {};
		additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

		// Define a search query to find existing user with current provider profile
		var searchQuery = {
			$or: [mainProviderSearchQuery, additionalProviderSearchQuery]
		};


		User.findOne(searchQuery, function(err, user) {
			if (err) {
				return done(err);
			} else {
				if (!user) {
					var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

					User.findUniqueUsername(possibleUsername, null, function(availableUsername) {
						user = new User({
							firstName: providerUserProfile.firstName,
							lastName: providerUserProfile.lastName,
							username: availableUsername,
							displayName: providerUserProfile.displayName,
							email: providerUserProfile.email,
							provider: providerUserProfile.provider,
							providerData: providerUserProfile.providerData
						});

						// And save the user
						user.save(function(err) {
							return done(err, user);
						});
					});
				} else {
					return done(err, user);
				}
			}
		});
	} else {
		// User is already logged in, join the provider data to the existing user
		var user = request.auth.credentials;

		// Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
		if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
			// Add the provider data to the additional provider data field
			if (!user.additionalProvidersData) user.additionalProvidersData = {};
			user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');

			// And save the user
			user.save(function(err) {
				return done(err, user, '/#!/settings/accounts');
			});
		} else {
			return done(user);
		}
	}
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(request, reply, next) {

	var user = request.session.get('login');
	var provider = request.params.provider;

	if (user && provider) {
		// Delete the additional provider
		if (user.additionalProvidersData[provider]) {
			delete user.additionalProvidersData[provider];

			// Then tell mongoose that we've updated the additionalProvidersData field
			user.markModified('additionalProvidersData');
		}

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
	}
};
