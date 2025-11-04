'use strict';

/**
 * index-checker router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::index-checker.index-checker');
