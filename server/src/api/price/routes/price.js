module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/price',
      handler: 'price.index',
      config: {
        auth: false,
      },
    },
  ],
};
