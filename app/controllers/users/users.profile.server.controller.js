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

  // For security measurement we remove the roles from the request.paylad object
  delete request.payload.roles;
  delete request.payload.id;

  User.update(reqUser.id, request.payload).exec(function (err, user) {
    if (err) {
      return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));

    } else {
      user = user.toJSON();
      request.session.set(request.server.app.sessionName, user);
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
      user: user.toJSON()
    });
};
