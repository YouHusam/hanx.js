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
		{
			path: '/articles/{articleId}',
			method: 'GET',
			handler: Articles.read
		}
		]);


/*
	app.route('/articles/:articleId')
		.get(articles.read)
		.put(users.requiresLogin, articles.hasAuthorization, articles.update)
		.delete(users.requiresLogin, articles.hasAuthorization, articles.delete);

	// Finish by binding the article middleware
	server.param('articleId', Articles.articleByID);*/
};
