const axios = require('axios');

module.exports = {
  async index(ctx) {
    const { coinId } = ctx.query;

    if (!coinId || typeof coinId !== 'string' || !coinId.trim()) {
      return ctx.badRequest('Query parameter "coinId" is required.');
    }

    const normalizedCoinId = coinId.trim().toLowerCase();

    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price',
        {
          params: { ids: normalizedCoinId, vs_currencies: 'usd' },
          headers: {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY,
          },
          timeout: 5000,
        }
      );

      const usd = response.data?.[normalizedCoinId]?.usd;

      if (typeof usd !== 'number') {
        return ctx.notFound(
          `Coin "${normalizedCoinId}" was not found on CoinGecko.`
        );
      }

      ctx.body = {
        coinId: normalizedCoinId,
        usd,
      };
    } catch (error) {
      strapi.log.error('CoinGecko price fetch failed', {
        coinId: normalizedCoinId,
        error: error.message,
      });

      ctx.status = 502;
      ctx.body = { error: 'Failed to fetch price from CoinGecko.' };
    }
  },
};
