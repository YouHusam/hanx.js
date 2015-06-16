'use strict';

/**
 * Module dependencies.
 */
var Users = require('../../app/controllers/users.server.controller'),
	Articles = require('../../app/controllers/articles.server.controller');

module.exports = function(server) {

	// Article Routes
	server.route([{
			path: '/articles',
			method: 'GET',
			handler: Articles.list
		},
		{
			path: '/articles',
			method: 'POST',
			config: {
				pre: [{method: Users.requiresLogin}],
				handler: Articles.create
			}
		},

		// Routes for articles with ID
		{
			path: '/articles/{articleId}',
			method: 'GET',
			config: {
				pre: [{method: Articles.articleByID}],
				handler: Articles.read
			}
		},
		{
			path: '/articles/{articleId}',
			method: 'PUT',
			config: {
				pre: [
					{method: Users.requiresLogin},
					{method: Articles.hasAuthorization},
					{method: Articles.articleByID}
					],
				handler: Articles.update
			}
		},
		{
			path: '/articles/{articleId}',
			method: 'DELETE',
			config: {
				pre: [
					{method: Users.requiresLogin},
					{method: Articles.hasAuthorization},
					{method: Articles.articleByID}
					],
				handler: Articles.delete
			}
		}
	]);
};
