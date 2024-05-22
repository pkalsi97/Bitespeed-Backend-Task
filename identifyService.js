const { Contact } = require('./contactmodel');

function validatePayload(req, res, next) {
  const { email, phoneNumber } = req.body;
  if (!email && !phoneNumber) {
    return res.status(400).json({ success: false, message: 'Payload must contain email, phoneNumber, or both' });
  }
  next();
}

module.exports = { validatePayload};