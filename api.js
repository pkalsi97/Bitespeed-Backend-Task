const express = require('express');
const { Contact } = require('./contactmodel');

const apiRouter = express.Router();

apiRouter.post('/identify', (req, res) => {
  const { email, phoneNumber } = req.body;
  res.json({ email, phoneNumber });
});

module.exports = apiRouter;
