'use strict';

/**
 * Module dependencies.
 */
exports.index = function (request, reply) {

  var user = request.auth.isAuthenticated ?
    request.auth.credentials :
    null;
  reply.view('index', {
    user: user || null,
    request: request
  });
};
