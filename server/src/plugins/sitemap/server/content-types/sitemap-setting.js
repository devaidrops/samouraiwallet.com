'use strict';

module.exports = {
  kind: 'singleType',
  collectionName: 'sitemap_setting',
  info: {
    name: 'SitemapSetting',
    displayName: 'Sitemap Setting',
    singularName: 'sitemap-setting',
    pluralName: 'sitemap-settings',
    tableName: 'sitemap-setting',
  },
  options: {
    draftAndPublish: false,
  },
  pluginOptions: {
    'content-manager': {
      visible: false,
    },
    'content-type-builder': {
      visible: false,
    },
  },
  attributes: {
    api_key: {
      type: 'string',
    },
    models: {
      type: 'string',
    },
    google_task_id: {
      type: 'string',
    },
    google_task_ids: {
      type: 'string',
    },
    yandex_task_id: {
      type: 'string',
    },
    yandex_task_ids: {
      type: 'string',
    },
  },
};
