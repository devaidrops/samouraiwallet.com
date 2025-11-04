'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('all-featured-parent-comments')
      .service('myService')
      .getWelcomeMessage();
  },
});
