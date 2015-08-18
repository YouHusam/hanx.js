'use strict';

/**
 * Module dependencies.
 */
var Waterline = require('waterline'),
		Uuid 			= require('node-uuid'),
		extend 		= Waterline.Collection.extend;

/**
 * Article Schema
 */
var Article = extend({
	identity: 'article',
	attributes: {
		id: {
			type: 'text',
			primaryKey: true,
			unique: true,
			required: true,
			defaultsTo: function () {
				return Uuid.v4();
			}
		},
		title: {
			type: 'string',
			defaultsTo: '',
			required: true,
			empty: false
		},
		content: {
			type: 'text',
			defaultsTo: ''
		},
		user: {
			model: 'user'
		},
		autoPK: false,
		autoCreatedAt: true
	}
});

module.exports = Article;
