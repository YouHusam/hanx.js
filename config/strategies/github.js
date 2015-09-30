'use strict';

/**
 * Module dependencies.
 */
var Config = require('../config'),
    Users = require('../../app/controllers/users.server.controller');


exports.strategyName = 'github';
exports.schemeName = 'bell';

exports.strategyConfig = {
  provider: 'github',
  password: Config.sessionSecret,
  clientId: Config.github.clientID,
  clientSecret: Config.github.clientSecret,
  isSecure: process.env.NODE_ENV === 'secure'
};

exports.preGithub = function (request, reply) {

  var profile = request.auth.credentials.profile;
  var pd = {};
  pd.accessToken = request.auth.credentials.token;
  pd.refreshToken = request.auth.credentials.refreshToken || undefined;

  // Create the user OAuth profile
  var displayName = profile.displayName.trim();
  var iSpace = displayName.indexOf(' '); // index of the whitespace following the firstName
  var firstName =  iSpace !== -1 ? displayName.substring(0, iSpace) : displayName;
  var lastName = iSpace !== -1 ? displayName.substring(iSpace + 1) : '';

  var cred = profile.raw;
  for (var id in cred) {
    pd[id] = cred[id];
  }

  // Create the user OAuth profile
  var providerUserProfile = {
    firstName: firstName,
    lastName: lastName,
    displayName: profile.displayName,
    email: profile.email,
    username: profile.username,
    provider: 'github',
    providerIdentifierField: 'id',
    providerData: pd
  };

  // Save the user OAuth profile
  Users.saveOAuthUserProfile(request, providerUserProfile, reply);
};
