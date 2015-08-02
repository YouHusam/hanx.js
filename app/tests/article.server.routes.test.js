'use strict';

var Should 		= require('should'),
		Code 			= require('code'),
		Server 		= require('../../server'),
		Mongoose 	= require('mongoose'),
		User 			= Mongoose.model('User'),
		Article 	= Mongoose.model('Article');

/**
 * Globals
 */
var credentials, user, article;

/**
 * Article routes tests
 */
describe('Article CRUD tests', function() {

	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new article
		user.save(function() {
			article = {
				title: 'Article Title',
				content: 'Article Content'
			};

			done();
		});
	});

	it('should be able to save an article if logged in', function(done) {

		Server.inject({
			method: 'POST',
			url: '/auth/signin',
			payload: credentials
		}, function(response) {

			Code.expect(response.statusCode, response.result.message).to.equal(200);
			if(response.result.error)
				done(new Error(response.result.message));

			// Get the userID
			var userId = user.id;


			// Save a new article
			Server.inject({
				method: 'POST',
				url: '/articles',
				payload: article,
				credentials: user
			}, function(response) {

				Code.expect(response.statusCode, response.result.message).to.equal(200);
				if(response.result.error)
					done(new Error(response.result.message));

				// Get a list of articles
				Server.inject({
					method: 'GET',
					url: '/articles',
					credntials: user
				}, function(response) {

					// Handle article getting error
					if(response.result.error)
						done(new Error(response.result.message));

					// Get Articles list
					var articles = response.result;

					// Set assertions
					Code.expect(articles[0].user._id.toString()).to.equal(userId);
					Code.expect(articles[0].title).to.equal('Article Title');

					// Call the assertion callback
					done();
				});
			});
		});
	});

	it('should not be able to save an article if not logged in', function(done) {

		Server.inject({
			method: 'POST',
			url: '/articles',
			payload: article
		}, function(response) {

			Code.expect(response.statusCode, response.result.message).to.equal(401);
			done();
		});
	});

	it('should not be able to save an article if no title is provided', function(done) {

		// Invalidate title field
		article.title = '';

		// Save a new article
		Server.inject({
			method: 'POST',
			url: '/articles',
			credentials: user
		}, function(response) {

			Code.expect(response.statusCode, response.result.message).to.equal(400);

			// Set message assertion
			Code.expect(response.result.message).to.equal('Title cannot be blank');

			// Handle article save error
			done();
		});
	});

	it('should be able to update an article if signed in', function(done) {

		Server.inject({
			method: 'POST',
			url: '/articles',
			credentials: user,
			payload: article
		}, function(saveResponse) {

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
				url:'/articles/' + saveResponse.result._id.toString(),
				credentials: user,
				payload: article
			}, function(updateResponse) {

				Code.expect(updateResponse.statusCode,
					updateResponse.result.message).to.equal(200);

				// Handle article save error
				if(updateResponse.result.error)
					done(new Error(updateResponse.result.message));

				// Set assertions
				Code.expect(updateResponse.result._id.toString())
						.to.equal(saveResponse.result._id.toString());
				Code.expect(updateResponse.result.title).to.equal('WHY YOU GOTTA BE SO MEAN?');

				done();

			});
		});
	});

	it('should be able to get a list of articles if not signed in', function(done) {

		// Create new article model instance
		var articleObj = new Article(article);

		// Save the article
		articleObj.save(function() {

			// Request articles
			Server.inject({
				method: 'GET',
				url: '/articles'
			}, function(response) {

				// Set assertion
				Code.expect(response.result).to.be.an.array().and.to.have.length(1);

				// Call the assertion callback
				done();
			});

		});
	});
/*



	it('should be able to get a single article if not signed in', function(done) {
		// Create new article model instance
		var articleObj = new Article(article);

		// Save the article
		articleObj.save(function() {
			request(app).get('/articles/' + articleObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('title', article.title);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should return proper error for single article which doesnt exist, if not signed in', function(done) {
		request(app).get('/articles/test')
			.end(function(req, res) {
				// Set assertion
				res.body.should.be.an.Object.with.property('message', 'Article is invalid');

				// Call the assertion callback
				done();
			});
	});

	it('should be able to delete an article if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new article
				agent.post('/articles')
					.send(article)
					.expect(200)
					.end(function(articleSaveErr, articleSaveRes) {
						// Handle article save error
						if (articleSaveErr) done(articleSaveErr);

						// Delete an existing article
						agent.delete('/articles/' + articleSaveRes.body._id)
							.send(article)
							.expect(200)
							.end(function(articleDeleteErr, articleDeleteRes) {
								// Handle article error error
								if (articleDeleteErr) done(articleDeleteErr);

								// Set assertions
								(articleDeleteRes.body._id).should.equal(articleSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete an article if not signed in', function(done) {
		// Set article user
		article.user = user;

		// Create new article model instance
		var articleObj = new Article(article);

		// Save the article
		articleObj.save(function() {
			// Try deleting article
			request(app).delete('/articles/' + articleObj._id)
			.expect(401)
			.end(function(articleDeleteErr, articleDeleteRes) {
				// Set message assertion
				(articleDeleteRes.body.message).should.match('User is not logged in');

				// Handle article error error
				done(articleDeleteErr);
			});

		});
	});*/

	afterEach(function(done) {
		User.remove().exec(function() {
			Article.remove().exec(done);
		});
	});
});
