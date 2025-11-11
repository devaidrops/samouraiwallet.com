const TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const isFresh = (entry) => entry && entry.expiresAt > Date.now();

module.exports = () => ({
  async getPrice(coinId) {
    const cached = cache.get(coinId);
    if (isFresh(cached)) {
      return cached.value;
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
        coinId
      )}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(
        `CoinGecko request failed with status ${response.status}`
      );
    }

    const payload = await response.json();
    const coinData = payload?.[coinId];

    if (!coinData || typeof coinData.usd !== 'number') {
      const error = new Error(`Coin "${coinId}" not found on CoinGecko.`);
      error.name = 'NotFoundError';
      throw error;
    }

    cache.set(coinId, {
      value: coinData.usd,
      expiresAt: Date.now() + TTL_MS,
    });

    return coinData.usd;
  },
});

