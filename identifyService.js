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

    console.log('Received request with email:', email, 'and phoneNumber:', phoneNumber);

    let contactA = null;
    let contactB = null;
    let primaryContactID = null;

    if (email) {
      contactA = await Contact.findOne({ where: { email } });
      console.log('Contact found with email:', email);
    }

    if (phoneNumber) {
      contactB = await Contact.findOne({ where: { phoneNumber } });
      console.log('Contact found with phoneNumber:', phoneNumber);
    }

    // if no matching email or phone we create a new contact
    if (!contactA && !contactB) {
      console.log('Creating new primary contact');
      let newContact = await Contact.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkPrecedence: 'primary',
      });
      primaryContactID = newContact.id;
      console.log('New primary contact created:', newContact.id);
    }

    if (contactA) {
      if (contactA.linkPrecedence == 'primary') {
        primaryContactID = contactA.id;
      } else if (contactA.linkPrecedence == 'secondary') {
        primaryContactID = contactA.linkedid;
      }
      console.log('Primary contact found using email:', primaryContactID);
    } else if (contactB) {
      if (contactB.linkPrecedence == 'primary') {
        primaryContactID = contactB.id;
      } else if (contactB.linkPrecedence == 'secondary') {
        primaryContactID = contactB.linkedid;
      }
      console.log('Primary contact found using phoneNumber:', primaryContactID);
    }

    let primaryContact = await Contact.findByPk(primaryContactID);

    // create Secondary Contact

    if (contactA && !contactB && phoneNumber) {
      console.log('Creating new secondary contact linked to contactA');
      let newContact = await Contact.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      });
      console.log('New secondary contact created:', newContact.id);
    }

    if (contactB && !contactA && email) {
      console.log('Creating new secondary contact linked to contactB');
      let newContact = await Contact.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      });
      console.log('New secondary contact created:', newContact.id);
    }

    // if both email and phone are present

    if (contactA && contactB) {
      console.log('Both email and phone contacts found');
      // primary turns into secondary
      if (contactA.id != contactB.id && contactA.linkPrecedence == 'primary' && contactB.linkPrecedence == 'primary') {
        console.log('Changing primary contact to secondary:', contactB.id);
        contactB.linkedId = contactA.id;
        contactB.linkPrecedence = 'secondary';
        await contactB.save();
        console.log('Primary contact updated to secondary');
      }
    }

    // find all secondary contacts

    console.log('Let\'s find all contacts linked to primary contact');

    const contacts = await Contact.findAll({ where: { linkedId: primaryContact.id } });

    console.log(contacts);
    let payload = {
      contact: {
        primaryContactId: primaryContact.id,
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: [],
      },
    };

    if (primaryContact.email) payload.contact.emails.push(primaryContact.email);
    if (primaryContact.phoneNumber) payload.contact.phoneNumbers.push(primaryContact.phoneNumber);

    contacts.forEach(contact => {

    if (contact.email && !payload.contact.emails.includes(contact.email)) {
      payload.contact.emails.push(contact.email);
    }
    if (contact.phoneNumber && !payload.contact.phoneNumbers.includes(contact.phoneNumber)) {
      payload.contact.phoneNumbers.push(contact.phoneNumber);
    }
      
      payload.contact.secondaryContactIds.push(contact.id);
    });

    console.log('Sending response with payload:', payload);
    res.json(payload);
  } catch (error) {
    console.error('Error in checkDb function:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports = { validatePayload, checkDb };



module.exports = { validatePayload, checkDb };
