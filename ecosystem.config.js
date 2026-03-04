module.exports = {
  apps: [
    {
      name: "strapi",
      cwd: "/srv/coinexplorers.com/server",
      script: "node",
      args: "node_modules/@strapi/strapi/bin/strapi.js start",
      env: {
        HOST: "127.0.0.1",
        PORT: "1337",
        NODE_ENV: "production",
        PUBLIC_CLIENT_URL: "https://samouraiwallet.tw1.su"
      }
    },
    {
      name: "api",
      cwd: "/srv/coinexplorers.com/api",
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
      cwd: "/srv/coinexplorers.com/client",
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
