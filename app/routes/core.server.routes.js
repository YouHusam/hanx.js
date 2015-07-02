'use strict';

module.exports = function (server) {

	// Root routing
	var core = require('../../app/controllers/core.server.controller');
	server.route([{
    path: '/',
    method: 'GET',
    config:{
      handler: core.index,
      auth:{
        mode: 'try',
        strategy: 'session'
      }
    }
  }]);
};
