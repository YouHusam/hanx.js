'use strict';

/**
 * Module dependencies.
 */

module.exports = function(server) {
	// User Routes
	var users = require('../../app/controllers/users.server.controller');

	server.route([

	// Setting up the users profile api
	{
		path: '/users/me',
		method: 'GET',
		config: {
			handler: users.me,
			auth: 'session'
		}
	},
	{
		path: '/users',
		method: 'PUT',
		config: {
			handler: users.update,
			auth: 'session'
		}
	},
	{
		path: '/users/accounts',
		method: 'DELETE',
		config: {
			handler: users.removeOAuthProvider,
			auth: 'session'
		}
	},

	// Setting up the users password api
	{
		path: '/users/password',
		method: 'POST',
		handler: users.changePassword
	},
	{
		path: '/auth/forgot',
		method: 'POST',
		handler: users.forgot
	},
	{
		path: '/auth/reset/{token}',
		method: 'GET',
		handler: users.validateResetToken
	},
	{
		path: '/auth/reset/{token}',
		method: 'POST',
		handler: users.reset
	},

	// Setting up the users authentication api
	{
		path: '/auth/signup',
		method: 'POST',
		handler: users.signup
	},
	{
		path: '/auth/signin',
		method: 'POST',
		config:{
			handler: users.signin,
			// auth: 'session'
		}
	},
	{
		path: '/auth/signout',
		method: 'GET',
		config:{
			handler: users.signout,
			auth: 'session'
		}
	},

	// Setting the facebook oauth routes
	{
		path: '/auth/facebook',
		method: ['GET','POST'],
		config: {
			auth: 'facebook',
			pre: [{
				method: require('../../config/strategies/facebook').preFacebook,
				assign: 'user'
			}],
			handler: users.oauthCallback,
			cache: { expiresIn: 5000 }
		}
	},

/*
	// Setting the twitter oauth routes
	{
		path: '/auth/twitter',
		method: 'GET',
		handler: passport.authenticate('twitter')
	},
	{
		path: '/auth/twitter/callback',
		method: 'GET',
		handler: users.oauthCallback('twitter')
	},

	// Setting the google oauth routes
	{
		path: '/auth/google',
		method: 'GET',
		handler:
			passport.authenticate('google', {
				scope: [
					'https://www.googleapis.com/auth/userinfo.profile',
					'https://www.googleapis.com/auth/userinfo.email'
				]
		})
	},
	{
		path: '/auth/google/callback',
		method: 'GET',
		handler: users.oauthCallback('google')
	},

	// Setting the linkedin oauth routes
	{
		path: '/auth/linkedin',
		method: 'GET',
		handler: passport.authenticate('linkedin')
	},
	{
		path: '/auth/linkedin/callback',
		method: 'GET',
		handler: users.oauthCallback('linkedin')
	},

	// Setting the github oauth routes
	{
		path: '/auth/github',
		method: 'GET',
		handler: passport.authenticate('github')
	},
	{
		path: '/auth/github/callback',
		method: 'GET',
		handler: users.oauthCallback('github')
	}*/
	]);
};
