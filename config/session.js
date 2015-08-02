'use strict';

/**
 * Module dependencies.
 */
var Boom = require('boom');

/**
 * Module init function.
 */
module.exports = function (server) {

	// Session Configuration
	var sessionConfig = {
		sessionName: server.app.sessionName
	};

	// Setup the scheme for the session strategy
	var sessionScheme = function (server, options) {

		return {
			authenticate: function (request, reply) {

				var session = request.state[options.sessionName];
				if(!session){
					return reply(Boom.unauthorized('Not authorised'));
				}

				if(session.id !== request.session.id){
					return reply(Boom.unauthorized('Not authorised'));
				}

				if (!request.session.get(options.sessionName)) {
					return reply(Boom.unauthorized('Not authorised'));
				}
				reply.continue({credentials: request.session.get(options.sessionName)});
			}
		};
	};

	// Register the scheme and the strategy
	server.auth.scheme('yar-session', sessionScheme);
	server.auth.strategy('session', 'yar-session', sessionConfig);

};
