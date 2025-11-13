module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    await next();

      ctx.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      ctx.set('Pragma', 'no-cache');
      ctx.set('Expires', '0');
      
  };
};