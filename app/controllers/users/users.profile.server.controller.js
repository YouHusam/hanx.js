'use strict';

/**
 * Module dependencies.
 */
var Boom           = require('boom'),
    Errorhandler   = require('../errors.server.controller.js');


/**
 * Update user details
 */
exports.update = function (request, reply) {

  var User = request.collections.user;

  // Init Variables
  var reqUser = request.auth.credentials;

  // For security reasons roles & id are removed from the request.payload object
  delete request.payload.roles;
  delete request.payload.id;

  User.update(reqUser.id, request.payload).exec(function (err, user) {
    if (err) {
      return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));

    } else {
      user = user[0].toJSON();

      request.server.app.authCache.set(request.auth.artifacts.id, user,
        1000 * 60 * 60 * 24,
        function (err) {

          if (err) {
            return reply(Boom.badRequest(err));
          }
        });
      return reply(user);
    }
  });
};

/**
 * Send User
 */
exports.me = function (request, reply) {

  var user = request.auth.credentials;
    reply({
      user: user
    });
};
