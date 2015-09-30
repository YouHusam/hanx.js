'use strict';

/**
 * Module dependencies.
 */
var Config = require('../config'),
    Users  = require('../../app/controllers/users.server.controller');


exports.strategyName = 'facebook';
exports.schemeName = 'bell';

exports.strategyConfig = {
  provider: 'facebook',
  password: Config.sessionSecret,
  clientId: Config.facebook.clientID,
  clientSecret: Config.facebook.clientSecret,
  isSecure: process.env.NODE_ENV === 'secure',
};

exports.preFacebook = function (request, reply) {

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
    displayName: profile.displayName,
    email: profile.email || profile.id + '@facebook.com',
    username: profile.username || profile.id,
    provider: 'facebook',
    providerIdentifierField: 'id',
    providerData: pd
  };

  // Save the user OAuth profile
  Users.saveOAuthUserProfile(request, providerUserProfile, reply);
};
