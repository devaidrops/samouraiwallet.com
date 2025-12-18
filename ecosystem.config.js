module.exports = {
  apps: [
    {
      name: "strapi",
      cwd: "/srv/coingecko/server",
      script: "npm",
      args: "run start",
      env: {
        HOST: "127.0.0.1",
        PORT: "1337",
        NODE_ENV: "production",
        PUBLIC_CLIENT_URL: "https://cryptoteh.ru"
      }
    },
    {
      name: "api",
      cwd: "/srv/coingecko/api",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: "8000",
        HOST: "127.0.0.1"
      }
    },
    {
      name: "frontend",
      cwd: "/srv/coingecko/client",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOST: "127.0.0.1"
      }
    }
  ]
};
