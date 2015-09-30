'use strict';

/**
 * Module dependencies.
 */
exports.index = function (request, reply) {

  var user = request.auth.credentials;
  reply.view('index', {
    user: user || null,
    request: request
  });
};
