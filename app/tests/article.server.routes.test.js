'use strict';

var Code       = require('code'),
    Server     = require('../../server');

/**
 * Globals
 */
var credentials, user, article, Article, User;

var init = function (cb) {

  User = Server.plugins.dogwater.collections.user;
  Article = Server.plugins.dogwater.collections.article;
  cb();
};

/**
 * Article routes tests
 */
describe('Article CRUD tests', function () {

  before(function (done) {

    if (Server.plugins.dogwater){
      init(done);
    } else {
      Server.on('pluginsLoaded', function () {

        init(done);
      });
    }
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'password'
    };

    // Create a new user
    user = {
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    };

    // Save a user to the test db and create new article
    User.create(user, function (err, newUser) {

      user = newUser;
      article = {
        title: 'Article Title',
        content: 'Article Content',
        user: user.id
      };

      done();
    });
  });

  it('should be able to save an article if logged in', function (done) {

    // Save a new article
    Server.inject({
      method: 'POST',
      url: '/articles',
      payload: article,
      credentials: user
    }, function (response) {

      // Get the userID
      var userId = user.id;

      Code.expect(response.statusCode, response.result.message).to.equal(200);
      if(response.result.error)
        done(new Error(response.result.message));

      // Get a list of articles
      Server.inject({
        method: 'GET',
        url: '/articles',
        credentials: user
      }, function (response) {

        // Handle article getting error
        if(response.result.error)
          done(new Error(response.result.message));

        // Get Articles list
        var articles = response.result;

        // Set assertions
        Code.expect(articles[0].user.id.toString()).to.equal(userId);
        Code.expect(articles[0].title).to.equal('Article Title');

        // Call the assertion callback
        done();
      });
    });
  });

  it('should not be able to save an article if not logged in', function (done) {

    Server.inject({
      method: 'POST',
      url: '/articles',
      payload: article
    }, function (response) {

      Code.expect(response.statusCode, response.result.message).to.equal(401);
      done();
    });
  });

  it('should not be able to save an article if no title is provided',
    function (done) {

      // Invalidate title field
      article.title = '';
      // Save a new article
      Server.inject({
        method: 'POST',
        url: '/articles',
        payload: article,
        credentials: user
      }, function (response) {

        Code.expect(response.statusCode, response.result.message).to.equal(400);

        // Set message assertion
        Code.expect(response.result.message).to.equal('Title cannot be blank');

        // Handle article save error
        done();
      });
  });

  it('should be able to update an article if signed in', function (done) {

    Server.inject({
      method: 'POST',
      url: '/articles',
      credentials: user,
      payload: article
    }, function (saveResponse) {

      // Get the userId
      var userId = user.id;

      Code.expect(saveResponse.statusCode,
        saveResponse.result.message).to.equal(200);

      // Handle article save error
      if(saveResponse.result.error)
        done(new Error(saveResponse.result.message));

      // Update article title
      article.title = 'WHY YOU GOTTA BE SO MEAN?';

      Server.inject({
        method: 'PUT',
        url:'/articles/' + saveResponse.result.id.toString(),
        credentials: user,
        payload: article
      }, function (updateResponse) {

        Code.expect(updateResponse.statusCode,
          updateResponse.result.message).to.equal(200);

        // Handle article save error
        if(updateResponse.result.error)
          done(new Error(updateResponse.result.message));

        // Set assertions
        Code.expect(updateResponse.result.user.id.toString()).to.equal(userId);
        Code.expect(updateResponse.result.id.toString())
            .to.equal(saveResponse.result.id.toString());
        Code.expect(updateResponse.result.title).
          to.equal('WHY YOU GOTTA BE SO MEAN?');

        done();

      });
    });
  });

  it('should be able to get a list of articles if not signed in',
    function (done) {

      // Save the article
      Article.create(article, function (err, article) {

        if (err) return done(err);
        // Request articles
        Server.inject({
          method: 'GET',
          url: '/articles'
        }, function (response) {

          // Set assertion
          Code.expect(response.result).to.be.an.array().and.to.have.length(1);

          // Call the assertion callback
          done();
        });

      });
  });

  it('should be able to get a single article if not signed in', function (done) {

    // Save the article
    Article.create(article, function (err, article) {

      if (err) return done(err);

      Server.inject({
        method: 'GET',
        url: '/articles/' + article.id.toString()
      }, function (response) {

        // Set assertion
        // For some reason it returns document object instead of normal object
        Code.expect(response.result.toJSON()).to.be.an.object().
          and.to.include({'title': article.title});

        // Call the assertion callback
        done();
      });
    });
  });

  it('should return 404 page for single article which doesnt exist, if not signed in',
    function (done) {

      Server.inject({
        method: 'GET',
        url: '/articles/test'
      }, function (response) {

        // Set assertion
        Code.expect(response.result).to.be.a.string().
          and.to.include('Page Not Found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an article if signed in', function (done) {

    Server.inject({
      method: 'POST',
      url: '/articles',
      credentials: user,
      payload: article
    }, function (articleSaveRes) {

      Code.expect(articleSaveRes.statusCode,
        articleSaveRes.result.message).to.equal(200);

      // Handle article save error
      if(articleSaveRes.result.error)
        done(new Error(articleSaveRes.result.message));

      Server.inject({
        method: 'DELETE',
        url: '/articles/' + articleSaveRes.result.id,
        credentials: user,
        payload: article
      }, function (articleDeleteRes) {

        Code.expect(articleDeleteRes.statusCode,
          articleDeleteRes.result.message).to.equal(200);

        // Handle article save error
        if(articleDeleteRes.result.error)
          done(new Error(articleDeleteRes.result.message));

      // Set assertions
      Code.expect(articleDeleteRes.result.id.toString())
        .to.be.equal(articleSaveRes.result.id.toString());

      done();
      });
    });
  });

  it('should not be able to delete an article if not signed in', function (done) {

    // Set article user
    article.user = user.id;

    // Save the article
    Article.create(article, function (err, article) {

      if (err) return done(err);

      // Try deleting article
      Server.inject({
        method: 'DELETE',
        url: '/articles/' + article.id
      },function (response) {

        Code.expect(response.statusCode, response.result.message).to.be.equal(401);
        // Set message assertion

        Code.expect(response.result.message).to.be.equal('User is not logged in');

        // Handle article error error
        done();
      });
    });
  });

  afterEach(function (done) {
    User.destroy({}).exec(function () {

      Article.destroy({}).exec(done);
    });
  });
});
