'use strict';

const { getService } = require("../utils");

module.exports = {
  async find(ctx) {
    const { query } = ctx;
    const page = +(query.page || 1);
    const pageSize = +(query.pageSize || 100);
    const indexationService = getService('indexationService');
    const { count, list } = await indexationService.getList(page, pageSize);

    return {
      page,
      pageSize,
      total: count,
      results: list,
    }
  },
};