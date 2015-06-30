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
				auth: 'session',
				handler: Articles.create
			}
		},

		// Routes for articles with ID
		{
			path: '/articles/{articleId}',
			method: 'GET',
			config: {
				pre: [{method: Articles.articleByID, assign: 'article'}],
				handler: Articles.read
			}
		},
		{
			path: '/articles/{articleId}',
			method: 'PUT',
			config: {
				auth: 'session',
				pre: [
					{method: Articles.articleByID, assign: 'article'},
					{method: Articles.hasAuthorization}
					],
				handler: Articles.update
			}
		},
		{
			path: '/articles/{articleId}',
			method: 'DELETE',
			config: {
				auth: 'session',
				pre: [
					{method: Articles.articleByID, assign: 'article'},
					{method: Articles.hasAuthorization}
					],
				handler: Articles.delete
			}
		}
	]);
};
