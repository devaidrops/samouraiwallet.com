const { UID_SITEMAP_SETTING, UID_SITEMAP } = require("../constants");

module.exports = [
  {
    method: 'GET',
    path: '/sitemap',
    handler: `${UID_SITEMAP}.find`,
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: 'GET',
    path: '/sitemap-setting',
    handler: `${UID_SITEMAP_SETTING}.find`,
  },
  {
    method: 'PUT',
    path: '/sitemap-setting',
    handler: `${UID_SITEMAP_SETTING}.update`,
  },
];
