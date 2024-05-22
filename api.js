const express = require('express');
const { validatePayload, checkDb } = require('./identifyService');

const apiRouter = express.Router();

apiRouter.post('/identify', validatePayload, checkDb, (req, res) => {
  res.json({ success: true, message: 'Identification successful' });
});

module.exports = apiRouter;
