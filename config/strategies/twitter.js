'use strict';

/**
 * Module dependencies.
 */
var Config = require('../config'),
    Users = require('../../app/controllers/users.server.controller');


exports.strategyName = 'twitter';
exports.schemeName = 'bell';

exports.strategyConfig = {
  provider: 'twitter',
  password: Config.sessionSecret,
  clientId: Config.twitter.clientID,
  clientSecret: Config.twitter.clientSecret,
  isSecure: process.env.NODE_ENV === 'secure',
};

exports.preTwitter = function (request, reply) {

  var profile = request.auth.credentials.profile;
  var pd = {};
  pd.accessToken = request.auth.credentials.token;
  pd.refreshToken = request.auth.credentials.refreshToken || undefined;

  var cred = profile.raw;
  for (var id in cred) {
    pd[id] = cred[id];
  }

  // Create the user OAuth profile
  var displayName = profile.displayName.trim();
  var iSpace = displayName.indexOf(' '); // index of the whitespace following the firstName
  var firstName =  iSpace !== -1 ? displayName.substring(0, iSpace) : displayName;
  var lastName = iSpace !== -1 ? displayName.substring(iSpace + 1) : '';


  // Create the user OAuth profile
  var providerUserProfile = {
    firstName: firstName,
    lastName: lastName,
    displayName: profile.displayName,
    email: profile.email,
    username: profile.username,
    provider: 'twitter',
    providerIdentifierField: 'id_str',
    providerData: pd
  };

  // Save the user OAuth profile
  Users.saveOAuthUserProfile(request, providerUserProfile, reply);
};
