// Маппинг устаревших/альтернативных id на актуальные в CoinGecko API
const COINGECKO_ID_ALIASES = {
  'bitcoin-sv': 'bitcoin-cash-sv',
};

module.exports = {
  async index(ctx) {
    const { coinId } = ctx.query;

    if (!coinId || typeof coinId !== 'string' || !coinId.trim()) {
      return ctx.badRequest('Query parameter "coinId" is required.');
    }

    const normalizedCoinId = coinId.trim().toLowerCase();
    const coingeckoId = COINGECKO_ID_ALIASES[normalizedCoinId] ?? normalizedCoinId;

    try {
      const usd = await strapi.service('api::price.price').getPrice(coingeckoId);

      ctx.body = {
        coinId: normalizedCoinId,
        usd,
      };
    } catch (error) {
      if (error.name === 'NotFoundError') {
        return ctx.notFound(
          `Coin "${normalizedCoinId}" was not found on CoinGecko.`
        );
      }

      strapi.log.error('CoinGecko price fetch failed', {
        coinId: normalizedCoinId,
        error: error.message,
      });

      ctx.status = 502;
      ctx.body = { error: 'Failed to fetch price from CoinGecko.' };
    }
  },
};
