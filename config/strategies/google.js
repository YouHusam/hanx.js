'use strict';

/**
 * Module dependencies.
 */
var Config = require('../config'),
    Users = require('../../app/controllers/users.server.controller');


exports.strategyName = 'google';
exports.schemeName = 'bell';

exports.strategyConfig = {
  provider: 'google',
  password: Config.sessionSecret,
  clientId: Config.google.clientID,
  clientSecret: Config.google.clientSecret,
  isSecure: process.env.NODE_ENV === 'secure'
};

exports.preGoogle = function (request, reply) {

  var profile = request.auth.credentials.profile;
  var pd = {};
  pd.accessToken = request.auth.credentials.token;
  pd.refreshToken = request.auth.credentials.refreshToken || undefined;

  var cred = profile.raw;
  for (var id in cred) {
    pd[id] = cred[id];
  }

  // Create the user OAuth profile
  var providerUserProfile = {
    firstName: profile.raw.given_name,
    lastName: profile.raw.family_name,
    displayName: profile.displayName,
    email: profile.email,
    username: profile.username,
    provider: 'google',
    providerIdentifierField: 'id',
    providerData: pd
  };

  // Save the user OAuth profile
  Users.saveOAuthUserProfile(request, providerUserProfile, reply);
};
