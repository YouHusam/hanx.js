'use strict';

/**
 * Module dependencies.
 */
var _              = require('lodash'),
    Boom           = require('boom'),
    Errorhandler   = require('../errors.server.controller'),
    Config         = require('../../../config/config'),
    Nodemailer     = require('nodemailer'),
    Async          = require('async'),
    cleanUser      = require('./users.authentication.server.controller.js').cleanUser,
    Crypto         = require('crypto');

var smtpTransport = Nodemailer.createTransport(Config.mailer.options);

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function (request, reply, next) {

  var User = request.collections.user;

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
        }, function (err, user) {

          if (!user) {
            return reply(Boom.badRequest('No account with that username has been found'));
          } else if (user.provider !== 'local') {
            return reply(Boom.badRequest('It seems like you signed up using your ' + user.provider + ' account'));
          } else {
            delete user.password;
            delete user.salt;
            user.resetPasswordToken = token;

            var passwordExpiresAt = new Date(Date.now() + 3600000); // 1 hour
            user.resetPasswordExpires = passwordExpiresAt.toISOString();

            User.update({username: user.username}, user, function (err, updatedUser) {
              done(err, token, user);
            });
          }
        });
      } else {
        return reply(Boom.badRequest('Username field must not be blank'));
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

  var User = request.collections.user;
  var dateNow = new Date();

  User.findOne({
    resetPasswordToken: request.params.token,
    resetPasswordExpires: {
      '>': dateNow.toISOString()
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

  var User = request.collections.user;

  // Init Variables
  var passwordDetails = request.payload;

  Async.waterfall([

    function (done) {

      var dateNow = new Date();
      User.findOne({
        resetPasswordToken: request.params.token,
        resetPasswordExpires: {
          '>': dateNow.toISOString()
        }
      }, function (err, user) {

        if (!err && user) {
          if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
            var newUser = {
              password: passwordDetails.newPassword,
              resetPasswordToken: undefined,
              resetPasswordExpires: undefined
            };

            User.update({username: user.username}, newUser, function (err) {

              if (err) {
                return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));
              } else {
                // Clear session
                request.session.clear(request.server.app.sessionName);

                // Copy user and remove sensetive and useless data
                var authedUser = cleanUser(user);
                if(authedUser !== {}){
                  // Create a new session to login the user
                  request.session.set(request.server.app.sessionName, authedUser);
                  reply(authedUser);
                }
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

  var User = request.collections.user;

  // Init Variables
  var passwordDetails = request.payload;

  if (request.auth.isAuthenticated) {
    if (passwordDetails.newPassword) {
      User.findOne({id: request.auth.credentials.id}, function (err, user) {

        if (!err && user) {
          if (user.authenticate(passwordDetails.currentPassword)) {
            if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
              user.password = passwordDetails.newPassword;

              User.update({id: user.id}, {password: user.password}).exec(function (err, user) {

                if (err) {
                  return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));

                } else {

                  // Clear session
                  request.session.clear(request.server.app.sessionName);

                  // Copy user and remove sensetive and useless data
                  var authedUser = cleanUser(user[0]);
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
