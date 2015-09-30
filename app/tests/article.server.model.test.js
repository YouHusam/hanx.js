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
var user, article, User, Article;

var init = function (cb){

  User = Server.plugins.dogwater.collections.user;
  Article = Server.plugins.dogwater.collections.article;
  cb();
};

/**
 * Unit tests
 */
describe('Article Model Unit Tests:', function() {

  before(function (done) {

    if (Server.plugins.dogwater){
      init(done);
    } else {
      Server.on('pluginsLoaded', function () {

        init(done);
      });
    }
  });

  beforeEach(function(done) {

    user = {
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      provider: 'local',
      username: 'username',
      password: 'password'
    };

    User.create(user, function(err, user) {

      if (err)
        return done(err);
      article = {
        title: 'Article Title',
        content: 'Article Content',
        user: user.id
      };

      done();
    });
  });

  describe('Method Save', function() {

    it('should be able to save without problems', function(done) {

      return Article.create(article, function(err, article) {
        should.not.exist(err);
        should.exist(article);
        done();
      });
    });

    it('should be able to show an error when try to save without title', function(done) {
      article.title = '';

      return Article.create(article, function(err, article) {

        should.exist(err);
        done();
      });
    });
  });

  afterEach(function(done) {

    Article.destroy({}).exec(function() {

      User.destroy({}).exec(done);
    });
  });
});
