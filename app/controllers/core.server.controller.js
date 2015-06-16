'use strict';

/**
 * Module dependencies.
 */
exports.index = function(request, reply) {

	reply.view('index', {
		user: request.user || null,
		request: request
	});
};
