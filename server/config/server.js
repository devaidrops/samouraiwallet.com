module.exports = ({ env }) => {
  const isProd = env("NODE_ENV") === "production"; // Check if running in production

  return {
    host: env("HOST", "0.0.0.0"),
    port: env.int("PORT", 1337),
    app: {
      keys: env.array("APP_KEYS"),
    },
    webhooks: {
      populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
    },
    // Only include these settings in production mode
    ...(isProd && {
      url: env("PUBLIC_URL", "http://127.0.0.1:1337"),
      admin: {
        url: env("ADMIN_URL", "http://127.0.0.1:1337/admin"),
        serveAdminPanel: true,
      },
    }),
  };
};
