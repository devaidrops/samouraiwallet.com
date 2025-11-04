'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

const { UID_SITEMAP_SETTING } = require('../constants');
const parseBody = require("../utils/parse-body");

module.exports = createCoreController(UID_SITEMAP_SETTING, ({ strapi }) => ({
  async find(ctx) {
    const { query } = ctx;
    return await strapi.query(UID_SITEMAP_SETTING).findOne();
  },

  async update(ctx) {
    const { data } = parseBody(ctx);
    const setting = await strapi.query(UID_SITEMAP_SETTING).findOne();
    let result;

    const models = (data.models || '').split(',');
    const apiKey = data.api_key;
    const validModels = models.filter((model) => !!strapi.contentTypes[model]);

    const settingPayload = { api_key: apiKey, models: validModels.join(',') };
    if (setting) {
      result = await strapi.query(UID_SITEMAP_SETTING).update({ where: { id: setting.id }, data: settingPayload });
    } else {
      result = await strapi.query(UID_SITEMAP_SETTING).create({ data: settingPayload });
    }
    return result;
  },
}));