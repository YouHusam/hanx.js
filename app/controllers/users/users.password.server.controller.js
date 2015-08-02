'use strict';

/**
 * Module dependencies.
 */
var _ 						= require('lodash'),
		Boom 					= require('boom'),
		Errorhandler 	= require('../errors.server.controller'),
		Mongoose 			= require('mongoose'),
		User 					= Mongoose.model('User'),
		Config 				= require('../../../config/config'),
		Nodemailer 		= require('nodemailer'),
		Async 				= require('async'),
		Crypto 				= require('crypto');

var smtpTransport = Nodemailer.createTransport(Config.mailer.options);

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function (request, reply, next) {

	Async.waterfall([
		// Generate random token
		function (done) {

			Crypto.randomBytes(20, function (err, buffer) {
				var token = buffer.toString('hex');
				done(err, token);
			});
		},
		// Lookup user by username
		function (token, done) {

			if (request.payload.username) {
				User.findOne({
					username: request.payload.username
				}, '-salt -password', function (err, user) {

					if (!user) {
						return reply(Boom.BadRequest('No account with that username has been found'));
					} else if (user.provider !== 'local') {
						return reply(Boom.BadRequest('It seems like you signed up using your ' + user.provider + ' account'));
					} else {
						user.resetPasswordToken = token;
						user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

						user.save(function (err) {
							done(err, token, user);
						});
					}
				});
			} else {
				return reply(Boom.BadRequest('Username field must not be blank'));
			}
		},
		function (token, user, done) {

			request.server.render('templates/reset-password-email', {
				name: user.displayName,
				appName: Config.app.title,
				url: 'http://' + request.headers.host + '/auth/reset/' + token
			}, function (err, emailHTML) {
				done(err, emailHTML, user);
			});
		},
		// If valid email, send reset email using service
		function (emailHTML, user, done) {

			var mailOptions = {
				to: user.email,
				from: Config.mailer.from,
				subject: 'Password Reset',
				html: emailHTML
			};
			smtpTransport.sendMail(mailOptions, function (err) {

				if (!err) {
					reply({message: 'An email has been sent to ' + user.email + ' with further instructions.'});
				} else {
					return reply(Boom.badRequest('Failure sending email'));
				}

				done(err);
			});
		}
	], function (err) {

		if (err) return reply.continue(err);
	});
};

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function (request, reply) {

	User.findOne({
		resetPasswordToken: request.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	}, function (err, user) {
		if (!user) {
			return reply.redirect('/#!/password/reset/invalid');
		}

		reply.redirect('/#!/password/reset/' + request.params.token);
	});
};

/**
 * Reset password POST from email token
 */
exports.reset = function (request, reply) {

	// Init Variables
	var passwordDetails = request.payload;

	Async.waterfall([

		function (done) {
			User.findOne({
				resetPasswordToken: request.params.token,
				resetPasswordExpires: {
					$gt: Date.now()
				}
			}, function (err, user) {
				if (!err && user) {
					if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
						user.password = passwordDetails.newPassword;
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

						user.save(function (err) {
							if (err) {
								return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));
							} else {
								request.login(user, function (err) {
									if (err) {
										reply(Boom.badRequest(err));
									} else {
										// Return authenticated user
										reply(user);

										done(err, user);
									}
								});
							}
						});
					} else {
						return reply(Boom.badRequest('Passwords do not match'));
					}
				} else {
					return reply(Boom.badRequest('Password reset token is invalid or has expired.'));
				}
			});
		},
		function (user, done) {

			request.server.render('templates/reset-password-confirm-email', {
				name: user.displayName,
				appName: Config.app.title
			}, function (err, emailHTML) {
				done(err, emailHTML, user);
			});
		},
		// If valid email, send reset email using service
		function (emailHTML, user, done) {

			var mailOptions = {
				to: user.email,
				from: Config.mailer.from,
				subject: 'Your password has been changed',
				html: emailHTML
			};

			smtpTransport.sendMail(mailOptions, function (err) {

				done(err, 'done');
			});
		}
	], function (err) {

		if (err) return reply.continue(err);
	});
};

/**
 * Change Password
 */
exports.changePassword = function (request, reply) {

	// Init Variables
	var passwordDetails = request.payload;

	if (request.auth.isAuthenticated) {
		if (passwordDetails.newPassword) {
			User.findById(request.auth.credentials.id, function (err, user) {

				if (!err && user) {
					if (user.authenticate(passwordDetails.currentPassword)) {
						if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
							user.password = passwordDetails.newPassword;

							user.save(function (err) {

								if (err) {
									return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));

								} else {

									// Clear session
									request.session.clear(request.server.app.sessionName);

									// Copy user and remove sensetive and useless data
									var authedUser = {};
									authedUser._id = user._id.toString();
									authedUser.id = user._id;
									authedUser.displayName = user.displayName;
									authedUser.provider = user.provider;
									authedUser.username = user.username;
									authedUser.created = user.created;
									authedUser.roles = user.roles;
									authedUser.email = user.email;
									authedUser.lastName = user.lastName;
									authedUser.firstName = user.firstName;
									if(authedUser !== {}){
										// Create a new session to login the user
										request.session.set(request.server.app.sessionName, authedUser);
										reply({
											message: 'Password changed successfully'
										});
									}
								}
							});
						} else {
							reply(Boom.badRequest('Passwords do not match'));

						}
					} else {
						reply(Boom.badRequest('Current password is incorrect'));

					}
				} else {
					reply(Boom.badRequest('User is not found'));

				}
			});
		} else {
			reply(Boom.badRequest('Please provide a new password'));

		}
	} else {
		reply(Boom.badRequest('User is not signed in'));
	}
};
