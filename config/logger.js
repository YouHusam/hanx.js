'use strict';

/**
 * Module dependencies.
 */

var Config = require('./config');

/**
 * Module init function.
 */
module.exports = {

	getLogReporters: function() {

		var reporters = [
			{
				reporter: require('good-console'),
				events: { response: '*' }
			}
		];

		if ('stream' in Config.log.options) {
			reporters.push({
				reporter: require('good-file'),
				events: { response: '*' },
				config: process.cwd() + '/' + Config.log.options.stream
			});
		}

		return reporters;
	}

};
