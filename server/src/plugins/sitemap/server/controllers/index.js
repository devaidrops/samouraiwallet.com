'use strict';

const sitemapSetting = require('./sitemap-setting.controller');
const sitemap = require('./sitemap.controller');

module.exports = {
  'sitemap-setting': sitemapSetting,
  'sitemap': sitemap,
};
