require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    client: process.env.DB_CLIENT ,
    connection: {
      host:  process.env.DB_HOST ,
      port: process.env.DB_PORT ,
      user:  process.env.DB_USER ,
      password: process.env.DB_PASSWORD ,
      database: process.env.DB_NAME ,
      ssl: {
        rejectUnauthorized: false
      }
    },
    pool: {
      min: Number(process.env.DB_POOL_MIN || 2),
      max: Number(process.env.DB_POOL_MAX || 10)
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, 'src/models/migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'src/models/seeds')
    }
  }
};
