'use strict';

/**
 * Module dependencies.
 */
var Uuid = require('node-uuid');

/**
 * Article Schema
 */
var Article = {
  identity: 'article',
  connection: 'postgreDev',
  autoPK: false,
  autoCreatedAt: true,
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
    }
  }
};

module.exports = Article;
