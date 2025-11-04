'use strict';

const { getService } = require("./utils");

module.exports = ({ strapi }) => {
  const indexationService = getService('indexationService');
  indexationService.scheduleIndexation();
  indexationService.scheduleIndexationFile();
};
