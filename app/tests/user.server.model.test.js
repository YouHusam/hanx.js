'use strict';

/**
 * Module dependencies.
 */
var should     = require('should'),
    Server     = require('../../server'),
    Config     = require('../../config/config');

/**
 * Globals
 */
var user, user2, User;

var init = function (cb) {

  User = Server.plugins.dogwater.collections.user;

  user = {
    firstName: 'Full',
    lastName: 'Name',
    displayName: 'Full Name',
    email: 'test@test.com',
    username: 'username',
    password: 'password',
    provider: 'local'
  };
  user2 = {
    firstName: 'Full',
    lastName: 'Name',
    displayName: 'Full Name',
    email: 'test@test.com',
    username: 'username',
    password: 'password',
    provider: 'local'
  };
  cb();
};

/**
 * Unit tests
 */
describe('User Model Unit Tests:', function() {

  before(function(done) {

    if (Server.plugins.dogwater){
      init(done);
    } else {
      Server.on('pluginsLoaded', function () {

        init(done);
      });
    }
  });

  describe('Method Save', function() {

    it('should begin with no users', function(done) {

      User.find({}, function(err, users) {

        users.should.have.length(0);
        done();
      });
    });

    it('should be able to save without problems', function(done) {

      User.create(user, done);
    });

    it('should fail to save an existing user again', function(done) {

      User.create(user, function() {
        User.create(user2, function(err) {
          should.exist(err);
          done();
        });
      });
    });

    it('should be able to show an error when try to save without first name', function(done) {
      user.firstName = '';
      return User.create(user, function(err) {
        should.exist(err);
        done();
      });
    });
  });

  after(function(done) {

    User.destroy({}).exec(done);
  });
});
