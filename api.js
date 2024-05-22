const express = require('express');
const { validatePayload } = require('./identifyService');
const { Contact } = require('./contactmodel');

const apiRouter = express.Router();

apiRouter.post('/identify', validatePayload, (req, res) => {
  const { email, phoneNumber } = req.body;
  res.json({ email, phoneNumber });
});

module.exports = apiRouter;