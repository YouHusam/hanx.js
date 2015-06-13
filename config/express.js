'use strict';

/**
 * Module dependencies.
 */
var Fs = require('fs'),
	Http = require('http'),
	Https = require('https'),
	Hapi = require('hapi'),
	Logger = require('./logger'),
	Config = require('./config'),
	Path = require('path');

module.exports = function(db) {

	// Initialize hapi app
	var server = new Hapi.Server();
	server.connection({port: Config.port});

	// Globbing model files
	Config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(Path.resolve(modelPath));
	});

	// Setting application local variables
	server.app.title = Config.app.title;
	server.app.description = Config.app.description;
	server.app.keywords = Config.app.keywords;
	server.app.facebookAppId = Config.facebook.clientID;
	server.app.jsFiles = Config.getJavaScriptAssets();
	server.app.cssFiles = Config.getCSSAssets();



	// Set swig as the template engine and views path
	server.views({
		engines: {
			'server.view.html': require('swig')
		},
		path: './app/views',
		isCached: function() {
			if (process.env.NODE_ENV === 'development') {
				// Disable views cache
				return false;
			} else if (process.env.NODE_ENV === 'production') {
				return true;
			}
			return true;
		}
	});

	// Enable logger (good)
	server.register({
		register: require('good'),
		options: {
			reporters: Logger.getLogReporters()
		}
	});

	// Setting the app router and static folder
	server.route({
		method: 'GET',
		path: '/{path*}',
		handler: {
	 		directory: {
				path: Path.resolve('./public'),
				listing: false,
				index: true
			}
		}
	});

	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: Config.sessionSecret,
		store: new mongoStore({
			mongooseConnection: db.connection,
			collection: Config.sessionCollection
		}),
		cookie: Config.sessionCookie,
		name: Config.sessionName
	}));

	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());

	// connect flash for flash messages
	app.use(flash());

	// Globbing routing files
	Config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function(err, req, res, next) {
		// If the error object doesn't exists
		if (!err) return next();

		// Log it
		console.error(err.stack);

		// Error page
		res.status(500).render('500', {
			error: err.stack
		});
	});

	// Assume 404 since no middleware responded
	app.use(function(req, res) {
		res.status(404).render('404', {
			url: req.originalUrl,
			error: 'Not Found'
		});
	});

	if (process.env.NODE_ENV === 'secure') {
		// Load SSL key and certificate
		var privateKey = Fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
		var certificate = Fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

		// Create HTTPS Server
		var httpsServer = Https.createServer({
			key: privateKey,
			cert: certificate
		}, app);

		// Return HTTPS server instance
		return httpsServer;
	}

	// Return Express server instance
	return app;
};
