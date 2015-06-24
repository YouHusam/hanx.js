'use strict';

/**
 * Module dependencies.
 */
var User 		= require('mongoose').model('User');

module.exports = function(username, password, callback) {

	User.findOne({
		username: username
	}, function(err, user) {

		if (err) {
			return callback(null, false);
		}
		if (!user) {
			return callback(null, false);
		}
		if (!user.authenticate(password)) {
			return callback(null, false);
		}

		return callback(null, true, user);
	});
};
