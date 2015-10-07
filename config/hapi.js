'use strict';

/**
 * Module dependencies.
 */
var Fs         = require('fs'),
    Https      = require('https'),
    Hapi       = require('hapi'),
    Logger     = require('./logger'),
    Config     = require('./config'),
    Dogwater   = require('dogwater'),
    pg         = require('sails-postgresql'),
    Catbox     = require('catbox'),
    Path       = require('path');

module.exports = function () {

  var serverOptions = {
    cache: {
      engine: new Catbox.Client(require('catbox-redis'), {
        host: Config.db.redis.host,
        port: Config.db.redis.port,
        database: Config.db.redis.database,
        password: Config.db.redis.password
      })
    },
    connections: {
      router: {
        stripTrailingSlash: true
      }
    }
  };

  // Initialize hapi app
  var server = new Hapi.Server(serverOptions);

  // Setup https server if NODE_ENV is secure
  if (process.env.NODE_ENV === 'secure') {
    // Load SSL key and certificate
    var privateKey = Fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
    var certificate = Fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

    // Create HTTPS Server
    var httpsServer = Https.createServer({
      key: privateKey,
      cert: certificate,
      passphrase: Config.passphrase
    });

    server.connection({
      listener: httpsServer,
      tls: true,
      autoListen: true,
      port: Config.port
    });
  } else {
    server.connection({port: Config.port});
  }

  // Setup global variables
  server.app.sessionName = Config.sessionName;

  // Globbing model files
  var models = [];
  Config.getGlobbedFiles('./app/models/**/*.js').forEach(function (modelPath) {
    models.push(require(Path.resolve(modelPath)));
  });

  var plugins = [
    { register: require('bell') },
    { register: require('inert') },
    { register: require('vision') },
    { register: require('hapi-auth-cookie') },
    {
      register: Dogwater,
      options: {
        adapters: {
          'default': pg,
          postgre: pg
        },
        connections: {
          postgreDefault: {
            adapter: 'postgre',
            host: Config.db.pg.host,
            port: Config.db.pg.port,
            database: Config.db.pg.database,
            user: Config.db.pg.user,
            password: Config.db.pg.password
          }
        },
        models: models
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

    // Set swig as the template engine and views path
    server.views({
      engines: {
        'server.view.html': require('swig')
      },
      path: './app/views',
      isCached: process.env.NODE_ENV !== 'development',
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

    // Setup Cache
    var authCache = server.cache({
      segment: server.app.sessionName,
      expiresIn: 1000 * 60 * 60 * 24
    });
    server.app.authCache = authCache;

    // Setup the authentication strategies
    server.auth.strategy('session', 'cookie', {
      cookie: server.app.sessionName,
      ttl: 1000 * 60 * 60 * 24,
      path: '/',
      isSecure: process.env.NODE_ENV === 'secure',
      password: Config.sessionSecret,

      validateFunc: function (request, session, callback) {

        server.app.authCache.get(session.id, function (err, cached) {

          if (err) {
            return callback(err, false);
          }

          if (!cached) {
            return callback(null, false);
          }

          if (session.id !== request.state[server.app.sessionName].id) {
            return callback(null, false);
          }

          return callback(null, true, cached);
        });
      }
    });

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

    server.emit('pluginsLoaded');
  });
  // Return Hapi server instance
  return server;
};
