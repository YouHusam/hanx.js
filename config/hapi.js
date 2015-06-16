'use strict';

/**
 * Module dependencies.
 */
var Fs 			= require('fs'),
		Http 		= require('http'),
		Https 	= require('https'),
		Hapi 		= require('hapi'),
		Logger 	= require('./logger'),
		Config 	= require('./config'),
		Path 		= require('path');

module.exports = function(db) {

	// Initialize hapi app
	var server = new Hapi.Server();
	server.connection({port: Config.port});

	// Globbing model files
	Config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(Path.resolve(modelPath));
	});

	// Register plugins
	server.register([
		{
			register: require('good'),
			options: {
				reporters: Logger.getLogReporters()
			}
		},
		{ register: require('bell') },
    { register: require('hapi-auth-cookie') },
    // { register: require('yar') }
	], function(err) {
		if (err) {
			console.error(err);
		}
	});

	// Set swig as the template engine and views path
	server.views({
		engines: {
			'server.view.html': require('swig')
		},
		path: './app/views',
		isCached: process.env.NODE_ENV === 'development' ? false : true,
		context: {
			title: Config.app.title,
			description: Config.app.description,
			keywords: Config.app.keywords,
			facebookAppId: Config.facebook.clientID,
			jsFiles: Config.getJavaScriptAssets(),
			cssFiles: Config.getCSSAssets()
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

	// Globbing routing files
	Config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
		require(Path.resolve(routePath))(server);
	});

	if (process.env.NODE_ENV === 'secure') {
		// Load SSL key and certificate
		var privateKey = Fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
		var certificate = Fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

		// Create HTTPS Server
		var httpsServer = Https.createServer({
			key: privateKey,
			cert: certificate
		}, server);

		// Return HTTPS server instance
		return httpsServer;
	}

	// Return Hapi server instance
	return server;
};
