require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.NODE_ENV === "production"? process.env.DB_HOST: 'localhost',
    port: process.env.DB_PORT,
    dialect: "postgres",
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.NODE_ENV === "production"? process.env.DB_HOST: '10.0.2.7',
    port: process.env.DB_PORT,
    dialect: "postgres",
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.NODE_ENV === "production"? process.env.DB_HOST: 'localhost',
    port: process.env.DB_PORT,
    dialect: "postgres",
  },
};