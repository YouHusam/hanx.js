'use strict';

/**
 * Module dependencies.
 */
var Fs 				= require('fs'),
		Http 			= require('http'),
		Https 		= require('https'),
		Hapi 			= require('hapi'),
		Logger 		= require('./logger'),
		Config 		= require('./config'),
		Boom 			= require('boom'),
		Dogwater 	= require('dogwater'),
		pg 				= require('sails-postgresql'),
		Path 			= require('path');

module.exports = function () {

	var serverOptions = {
		cache:{
			engine: require('catbox-mongodb')
		},
		connections: {
			router: {
				stripTrailingSlash: true
			}
		}
	};

	// Initialize hapi app
	var server = new Hapi.Server(serverOptions);
	server.connection({port: Config.port});

	// Setup global variables
	server.app.sessionName = Config.sessionName;

	// Globbing model files
	var models = [];
	Config.getGlobbedFiles('./app/models/**/*.js').forEach(function (modelPath) {
		models.push(require(Path.resolve(modelPath)));
	});

	var plugins =[
		{ register: require('bell') },
		{
			register: Dogwater,
			options: {
				adapters: {
					'default': pg,
					postgre: pg
				},
				connections: {
					postgreDev: {
					  adapter: 'postgre',
					  host: 'localhost',
					  database: 'development',
					  user: '',
					  password: ''
					}
				},
				models: models
			}
		},
		{
			register: require('yar'),
			options: {
				name: server.app.sessionName,
				maxCookieSize: 0,
				expiresIn: 1000 * 60 * 60 * 24,
				cookieOptions: {
					path: '/',
					isSecure: false,
					password: Config.sessionSecret
				}
			}
	 }
	];

	if (Config.log.enabled) {
		plugins.push({
			register: require('good'),
			options: {
				reporters: Logger.getLogReporters()
			}
		});
	}

	// Register plugins
	server.register(plugins, function (err) {
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

	// Setup the authentication strategies
	require('./session')(server);
	require('./strategies')(server);

	// Globbing routing files
	Config.getGlobbedFiles('./app/routes/**/*.js').forEach(function (routePath) {
		require(Path.resolve(routePath))(server);
	});

	// Hande 404 errors
	server.ext('onPreResponse', function (request, reply) {

		if (request.response.isBoom) {
			if(request.response.output.statusCode === 404)
				return reply.view('404', {
					url: request.url.path
				});
		}
		return reply.continue();
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
