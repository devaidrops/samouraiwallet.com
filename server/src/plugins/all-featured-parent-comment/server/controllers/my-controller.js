'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('all-featured-parent-comment')
      .service('myService')
      .getWelcomeMessage();
  },
});
