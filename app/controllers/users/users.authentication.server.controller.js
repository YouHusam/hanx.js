'use strict';

/**
 * Module dependencies.
 */
var _              = require('lodash'),
    Boom           = require('boom'),
    Errorhandler   = require('../errors.server.controller');

/**
 * Signup
 */
exports.signup = function (request, reply) {

  var User = request.collections.user;
  // For security measurement we remove the roles from the request.body object
  delete request.payload.roles;

  // Init Variables
  var user = request.payload;

  // Add missing user fields
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName;

  // Then save the user
  User.create(user, function (err) {

    if (err) {
      return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));
    } else {
      // Remove sensitive data before login
      delete user.password;
      delete user.salt;

      request.session.set(request.server.app.sessionName, user);
      reply(user);
    }
  });
};

/**
 * Clean useless data from the user object
 */
var cleanUser = function (user) {

  // Copy user and remove sensetive and useless data
  var cleanedUser = {};
  cleanedUser.id = user.id;
  cleanedUser.displayName = user.displayName;
  cleanedUser.provider = user.provider;
  cleanedUser.username = user.username;
  cleanedUser.createdAt = user.createdAt;
  cleanedUser.roles = user.roles;
  cleanedUser.email = user.email;
  cleanedUser.lastName = user.lastName;
  cleanedUser.firstName = user.firstName;
  cleanedUser.additionalProvidersData = user.additionalProvidersData;

  return cleanedUser;
};

exports.cleanUser = cleanUser;

/**
 * Local Signin
 */
exports.signin = function (request, reply) {

  var User = request.collections.user;

  if (!request.auth.isAuthenticated) {

    var username = request.payload.username;
    var password = request.payload.password;
    if (!username || !password) {
      return reply(Boom.unauthorized('Username and password should not be blank'));
    }

    User.findOne({
      username: username
    }, function (err, user) {

      if (err) {
        return reply(Boom.unauthorized(err));
      }
      if (!user) {
        return reply(Boom.unauthorized('Username or password are wrong'));
      }
      if (!user.authenticate(password)) {
        return reply(Boom.unauthorized('Username or password are wrong'));
      }

      var authedUser = cleanUser(user);
      if(authedUser !== {}){
        request.session.set(request.server.app.sessionName, authedUser);
        return reply(authedUser);
      }
    });
  } else {
    var user = request.auth.credentials;
    return reply.redirect('/', user);
  }
};

/**
 * Signout
 */
exports.signout = function (request, reply) {

  request.session.clear(request.server.app.sessionName);
  reply.redirect('/');
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (request, reply) {

  if (!request.auth.isAuthenticated) {
    return reply.redirect('/#!/signin');
  }
  request.session.set(request.server.app.sessionName, request.pre.user);
  return reply.redirect('/');
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (request, providerUserProfile, done) {

  var User = request.collections.user;

  if (!request.session.get(request.server.app.sessionName) &&
      request.auth.isAuthenticated) {

    // Define a search query to find existing user with current provider profile
    var query = 'SELECT * FROM "user" WHERE ('+
      '"provider" = \'' + providerUserProfile.provider + '\' AND '+
      '"providerData"->>\'' + providerUserProfile.providerIdentifierField + '\' = \'' +
      providerUserProfile.providerData[providerUserProfile.providerIdentifierField] +
      '\') OR ("additionalProvidersData"#>>\'{' + providerUserProfile.provider + ',' +
      providerUserProfile.providerIdentifierField + '}\' = \''+
      providerUserProfile.providerData[providerUserProfile.providerIdentifierField]+
      '\') LIMIT 1;';

    User.query(query, function (err, results) {

      if (err) {
        return done(err);
      } else {
        if (!results.rows[0]) {
          var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

          User.findUniqueUsername(possibleUsername, null, function (availableUsername) {

            var user = {
              firstName: providerUserProfile.firstName,
              lastName: providerUserProfile.lastName,
              username: availableUsername,
              displayName: providerUserProfile.displayName,
              email: providerUserProfile.email,
              provider: providerUserProfile.provider,
              providerData: providerUserProfile.providerData
            };

            // And save the user
            User.create(user, function (err) {

              return done(err, user);
            });
          });
        } else {

          // Remove unwanted data from user
          var authedUser = cleanUser(results.rows[0]);

          return done(err, authedUser);
        }
      }
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    var AuthUser = request.session.get(request.server.app.sessionName);
    User.findOne({id: AuthUser.id}, function (err, user) {

      // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
      if (user.provider !== providerUserProfile.provider &&
        (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
        // Add the provider data to the additional provider data field
        if (!user.additionalProvidersData) user.additionalProvidersData = {};
        user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

        // And save the user
        User.update(AuthUser, user, function (err) {

          return done(err, user, '/#!/settings/accounts');
        });
      } else {
        return done(user);
      }
    });

  }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (request, reply, next) {

  var User = request.collections.user;

  var user = request.session.get(request.server.app.sessionName);
  var provider = request.params.provider;

  if (user && provider) {
    // Delete the additional provider
    if (user.additionalProvidersData[provider]) {
      delete user.additionalProvidersData[provider];
    }

    User.update(request.auth.credentials, user, function (err) {

      if (err) {
        return reply(Boom.badRequest(Errorhandler.getErrorMessage(err)));
      } else {
        request.login(user, function (err) {

          if (err) {
            reply(Boom.badRequest(err));
          } else {
            reply(user);
          }
        });
      }
    });
  }
};
