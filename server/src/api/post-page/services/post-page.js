'use strict';

/**
 * post-page service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::post-page.post-page');
