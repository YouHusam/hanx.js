'use strict';

/**
 * Module dependencies.
 */
var Errorhandler   = require('./errors.server.controller'),
    Boom           = require('boom'),
    _              = require('lodash');

/**
 * Create a article
 */
exports.create = function (request, reply) {

  var Article = request.collections.article;
  var article = request.payload;
  article.user = request.auth.credentials.id;

  Article.create(article, function (err, article) {

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

  var Article = request.collections.article;
  Article.update({id: request.pre.article.id}, request.payload,
    function (err, article) {

      if (err) {
        return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));
      } else {
        Article.findOne(article).populate('user')
          .exec(function (err, article) {

            if (err) return reply(err);
            if (!article) {
              return reply(Boom.notFound('Article not found'));
            }
            reply(article);
          });
      }
  });
};

/**
 * Delete an article
 */
exports.delete = function (request, reply) {

  var Article = request.collections.article;
  var article = request.pre.article;
  Article.destroy({id: article.id}, function (err) {

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

  var Article = request.collections.article;

  Article.find({}).sort({createdAt: 'desc'}).populate('user')
    .exec(function (err, articles) {

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

  var Article = request.collections.article;
  var id = request.params.articleId;

  Article.findOne({id: id}).populate('user').exec(function (err, article) {

    if (err) return reply(err);
    if (!article) {
      return reply(Boom.notFound('Article not found'));
    }
    reply(article);
  });
};

/**
 * Article authorization middleware
 */
exports.hasAuthorization = function (request, reply) {

  if (request.pre.article.user.id.toString() !==
      request.auth.credentials.id.toString()) {
    return reply(Boom.forbidden('User is not authorized'));
  }
  reply();
};
