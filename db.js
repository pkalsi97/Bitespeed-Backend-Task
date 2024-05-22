require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const caCertPath = path.join(__dirname, 'ca-cert.pem');
const caCert = fs.readFileSync(caCertPath);

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialectOptions: {
    ssl: {
      require: true,
      ca: [caCert]
    }
  },
  logging: false
});

module.exports = sequelize;
