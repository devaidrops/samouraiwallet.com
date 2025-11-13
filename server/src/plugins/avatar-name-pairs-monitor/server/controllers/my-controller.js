'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('avatar-name-pairs-monitor')
      .service('myService')
      .getWelcomeMessage();
  },
});
