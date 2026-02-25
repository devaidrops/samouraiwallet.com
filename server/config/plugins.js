module.exports = () => ({
  upload: {
    config: {
      sizeLimit: 65 * 1024 * 1024,
    },
  },
  menus: {
    config: {
      maxDepth: 3,
    },
  },
  "all-featured-parent-comments": {
    enabled: true,
    resolve: "./src/plugins/all-featured-parent-comments",
  },
  "all-featured-parent-comment": {
    enabled: true,
    resolve: "./src/plugins/all-featured-parent-comment",
  },
  "avatar-name-pairs-monitor": {
    enabled: true,
    resolve: "./src/plugins/avatar-name-pairs-monitor",
  },
  sitemap: {
    enabled: true,
    resolve: "./src/plugins/sitemap",
  },
});
