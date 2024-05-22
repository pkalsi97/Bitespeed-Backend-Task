const express = require('express');
const sequelize = require('./db');
const Contact = require('./contactmodel');

const app = express();

sequelize.sync()
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch((error) => {
    console.error('Unable to sync models with the database:', error);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
