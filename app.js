const express = require('express');
const sequelize = require('./db');
const apiRouter = require('./api');

const app = express();

app.use(express.json());
app.use('/api', apiRouter);

sequelize.sync()
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch((error) => {
    console.error('Unable to sync models with the database:', error);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
