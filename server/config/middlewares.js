module.exports = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '65mb',
      jsonLimit: '65mb',
      textLimit: '65mb',
      formidable: {
        maxFileSize: 65 * 1024 * 1024,
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
   'strapi::public', 
  {
    resolve: './src/middlewares/cache-control',
    config: {},
  },
];
