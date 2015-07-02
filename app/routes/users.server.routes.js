'use strict';

/**
 * Module dependencies.
 */

module.exports = function (server) {

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
			handler: users.oauthCallback
		}
	},


	// Setting the twitter oauth routes
	{
		path: '/auth/twitter',
		method: ['GET','POST'],
		config: {
			auth: 'twitter',
			pre: [{
				method: require('../../config/strategies/twitter').preTwitter,
				assign: 'user'
			}],
			handler: users.oauthCallback
		}
	},

	// Setting the google oauth routes
	{
		path: '/auth/google',
		method: ['GET','POST'],
		config: {
			auth: 'google',
			pre: [{
				method: require('../../config/strategies/google').preGoogle,
				assign: 'user'
			}],
			handler: users.oauthCallback
		}
	},

	// Setting the github oauth routes
	{
		path: '/auth/github',
		method: ['GET','POST'],
		config: {
			auth: 'github',
			pre: [{
				method: require('../../config/strategies/github').preGithub,
				assign: 'user'
			}],
			handler: users.oauthCallback
		}
	},

	// Setting the linkedin oauth routes
	{
		path: '/auth/linkedin',
		method: ['GET','POST'],
		config: {
			auth: 'linkedin',
			pre: [{
				method: require('../../config/strategies/linkedin').preLinkedin,
				assign: 'user'
			}],
			handler: users.oauthCallback
		}
	}
	]);
};
