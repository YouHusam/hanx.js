'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Errorhandler = require('./errors.server.controller'),
	Article = mongoose.model('Article'),
	Boom = require('boom'),
	_ = require('lodash');

/**
 * Create a article
 */
exports.create = function (request, reply) {

	var article = new Article(request.payload);
	article.user = request.auth.credentials;

	article.save(function (err) {
		if (err) {
			return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));
		} else {
			reply(article);
		}
	});
};

/**
 * Show the current article
 */
exports.read = function (request, reply) {

	reply(request.pre.article);
};

/**
 * Update a article
 */
exports.update = function (request, reply) {

	var article = Article.findOne(request.pre.article, function (err, article) {

		if(article){
			article = _.extend(article, request.payload);
			article.save(function (err) {

				if (err) {
					return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));
				} else {
					reply(article);
				}
			});
		}	else {
			reply(Boom.badRequest('Article not found'));
		}
	});
};

/**
 * Delete an article
 */
exports.delete = function (request, reply) {

	var article = new Article(request.pre.article);

	article.remove(function (err) {

		if (err) {
			return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));
		} else {
			reply(article);
		}
	});
};

/**
 * List of Articles
 */
exports.list = function (request, reply) {

	Article.find().sort('-created').populate('user', 'displayName').exec(function (err, articles) {

		if (err) {
			return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));
		} else {
			reply(articles);
		}
	});
};

/**
 * Article middleware
 */
exports.articleByID = function (request, reply) {

	var id = request.params.articleId;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return reply(Boom.badRequest('Article is invalid'));
	}

	Article.findById(id).populate('user', 'displayName').exec(function (err, article) {

		if (err) return reply(err);
		if (!article) {
			return reply(Boom.notfound('Article not found'));
		}
		reply(article);
	});
};

/**
 * Article authorization middleware
 */
exports.hasAuthorization = function (request, reply) {

	if (request.pre.article.user.id !==
			request.auth.credentials._id) {
		return reply(Boom.forbidden('User is not authorized'));
	}
	reply();
};
