'use strict';

/**
 * Module dependencies.
 */
var _ 		= require('lodash'),
		Boom 	= require('boom');

/**
 * User middleware
 */
exports.userByID = function (request, reply) {

	var User = request.collections.user;
	var id = request.param.id;
	User.findOne({id: id}).exec(function (err, user) {

		if (err)
			return reply(err);

		if (!user)
			return reply(new Error('Failed to load User ' + id));

		request.profile = user;
		reply.continue();
	});
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function (roles) {

	var _this = this;

	return function (request, reply) {
		_this.requireplyLogin(request, reply, function () {

			if (_.intersection(request.payload.user.roles, roles).length) {
				return reply.continue();

			} else {
				return reply(Boom.forbidden('User is not authorized'));
			}
		});
	};
};
