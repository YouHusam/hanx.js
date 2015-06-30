'use strict';
var Boom 		= require('boom'),
		Config 	= require('../config');

exports.strategyName = 'session';
exports.strategyConfig = {
	sessionName: Config.sessionName
};

var scheme = function(server, options) {

	return {
		authenticate: function (request, reply) {

			var session = request.state[options.sessionName];
			if(!session){
				return reply(Boom.unauthorized('Not authorised1'));
			}

			if(session.id !== request.session.id){
				return reply(Boom.unauthorized('Not authorised2'));
			}

			if (!request.session.get(options.sessionName)) {
				return reply(Boom.unauthorized('Not authorised3'));
			}

			reply.continue({credentials: request.session.get(options.sessionName)});
		}
	};
};


exports.setServer = function(server) {
server.auth.scheme('yar-session', scheme);


};

