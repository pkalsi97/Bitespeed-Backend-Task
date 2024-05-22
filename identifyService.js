const Contact = require('./contactmodel');

function validatePayload(req, res, next) {
  const { email, phoneNumber } = req.body;
  if (!email && !phoneNumber) {
    return res.status(400).json({ success: false, message: 'Payload must contain email, phoneNumber, or both' });
  }
  next();
}

async function checkDb(req, res, next) {
  try {
    const { email, phoneNumber } = req.body;
    console.log('Incoming request:', { email, phoneNumber });

    let contact;
    if (email) {
      contact = await Contact.findOne({ where: { email } });
      console.log('Found contact by email:', contact);
    } else if (phoneNumber) {
      contact = await Contact.findOne({ where: { phoneNumber } });
      console.log('Found contact by phoneNumber:', contact);
    }

    if (!contact) {
      contact = await Contact.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkPrecedence: 'primary',
      });
      console.log('Primary contact created:', contact);
    }

    const payload = {
      contact: {
        primaryContactId: contact.id,
        emails: [contact.email],
        phoneNumbers: [contact.phoneNumber],
        secondaryContactIds: [],
      },
    };

    console.log('Returning payload:', payload);
    res.json(payload);
  } catch (error) {
    console.error('Error checking database:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports = { validatePayload, checkDb };
