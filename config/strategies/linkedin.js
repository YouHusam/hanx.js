'use strict';

/**
 * Module dependencies.
 */
var Config = require('../config'),
    Users = require('../../app/controllers/users.server.controller');


exports.strategyName = 'linkedin';
exports.schemeName = 'bell';

exports.strategyConfig = {
  provider: 'linkedin',
  password: Config.sessionSecret,
  clientId: Config.linkedin.clientID,
  clientSecret: Config.linkedin.clientSecret,
  scope: ['r_basicprofile', 'r_emailaddress'],
  isSecure: process.env.NODE_ENV === 'secure'
};

exports.preLinkedin = function (request, reply) {

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
    firstName: profile.name.first,
    lastName: profile.name.last,
    displayName: profile.name.first + ' ' + profile.name.last,
    email: profile.email,
    username: profile.username || profile.id,
    provider: 'linkedin',
    providerIdentifierField: 'id',
    providerData: pd
  };

  // Save the user OAuth profile
  Users.saveOAuthUserProfile(request, providerUserProfile, reply);
};
