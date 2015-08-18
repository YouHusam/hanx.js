'use strict';

/**
 * Module dependencies.
 */
var Waterline = require('waterline'),
		Uuid 			= require('node-uuid'),
		extend 		= Waterline.Collection.extend,
		crypto 		= require('crypto');

/**
 * User Schema
 */
var User = extend({

	types:{

		/**
		 * A Validation function for local strategy password
		 */
		password: function (password) {

			return (this.provider !== 'local' || (password && password.length > 6));
		}
	},

	identity: 'user',

	attributes: {
		id: {
			type: 'text',
			primaryKey: true,
			unique: true,
			required: true,
			defaultsTo: function () {
				return Uuid.v4();
			}
		},
		firstName: {
			type: 'string',
			defaultsTo: '',
			empty: false
		},
		lastName: {
			type: 'string',
			defaultsTo: '',
			empty: false
		},
		displayName: {
			type: 'string',
		},
		email: {
			type: 'string',
			defaultsTo: '',
			empty: false,
			email: true
		},
		username: {
			type: 'string',
			unique: true,
			required: true
		},
		password: {
			type: 'string',
			defaultsTo: '',
			password: true
		},
		salt: {
			type: 'string'
		},
		provider: {
			type: 'string',
			required: true
		},
		providerData: 'json',
		additionalProvidersData: 'json',
		roles: {
			type: 'string',
			enum: ['user', 'admin'],
			defaultsTo: ['user']
		},
		/* For reset password */
		resetPasswordToken: {
			type: 'string'
		},
		resetPasswordExpires: {
			type: 'datetime'
		},
		autoPK: false,
		autoCreatedAt: true,
		autoUpdatedAt: true,
		/**
		 * Create instance method for hashing a password
		 */
		hashPassword: function (password, salt) {

			if (!salt)
				salt = this.salt;
			if (salt && password) {
				return crypto.pbkdf2Sync(password,
					new Buffer(salt, 'base64'), 10000, 64).toString('base64');
			} else {
				return password;
			}
		},

		/**
		 * Create instance method for authenticating user
		 */
		authenticate: function (password) {

			return this.password === this.hashPassword(password);
		},
	},

	/**
	 * Find possible not used username
	 */
	findUniqueUsername: function (username, suffix, callback) {

		var _this = this;
		var possibleUsername = username + (suffix || '');

		_this.findOne()
		.where({username: possibleUsername})
		.exec(function (err, user) {

			if (!err) {
				if (!user) {
					callback(possibleUsername);
				} else {
					return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
				}
			} else {
				callback(null);
			}
		});
	},

	/**
	 * Hook a pre save method to hash the password
	 */
	beforeCreate: function (values, next) {

		if (values.password && values.password.length > 6){
			values.salt = crypto.randomBytes(16).toString('base64');
			values.password = this.hashPassword(values.password, values.salt);
		}
		next();
	}
});

module.exports = User;
