'use strict';

/**
 * config-thread service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::config-thread.config-thread');
