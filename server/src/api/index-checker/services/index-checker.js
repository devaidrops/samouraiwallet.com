'use strict';

/**
 * index-checker service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::index-checker.index-checker');
