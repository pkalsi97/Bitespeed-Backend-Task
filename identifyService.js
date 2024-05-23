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
    let payload = {
      contact: {
        primaryContactId: null,
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: [],
      },
    };

    if (email) {
      console.log('Checking for contact with email:', email);
      contactA = await Contact.findOne({ where: { email } });
      console.log('Contact with email found:', contactA);
    }
    if (phoneNumber) {
      console.log('Checking for contact with phoneNumber:', phoneNumber);
      contactB = await Contact.findOne({ where: { phoneNumber } });
      console.log('Contact with phoneNumber found:', contactB);
    }

    if (!contactA && !contactB) {
      console.log('No matching email or phone, creating a new primary contact');
      let newContact = await Contact.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkPrecedence: 'primary',
      });
      primaryContactID = newContact.id;
      payload.contact.primaryContactId = primaryContactID;
      payload.contact.emails.push(newContact.email);
      payload.contact.phoneNumbers.push(newContact.phoneNumber);
      console.log('New primary contact created:', newContact);
      return res.json(payload);
    }

    let primaryContactA_ID;
    let primaryContactB_ID;

    if (contactA) {
      if (contactA.linkPrecedence === 'primary') {
        primaryContactA_ID = contactA.id;
      } else if (contactA.linkPrecedence === 'secondary') {
        primaryContactA_ID = contactA.linkedId;
      }
      console.log('Primary contact A ID:', primaryContactA_ID);
    }

    if (contactB) {
      if (contactB.linkPrecedence === 'primary') {
        primaryContactB_ID = contactB.id;
      } else if (contactB.linkPrecedence === 'secondary') {
        primaryContactB_ID = contactB.linkedId;
      }
      console.log('Primary contact B ID:', primaryContactB_ID);
    }

    if (primaryContactA_ID && primaryContactB_ID && (primaryContactA_ID !== primaryContactB_ID)) {
      console.log('Both primary contact A and B exist and are different, linking them');
      primaryContactB = await Contact.findByPk(primaryContactB_ID);
      const tempContacts = await Contact.findAll({ where: { linkedId: primaryContactB_ID } });
      console.log('Contacts linked to primary contact B:', tempContacts);
      for (const tempContact of tempContacts) {
        tempContact.linkedId = primaryContactA_ID;
        await tempContact.save();
        console.log('Updated linked contact:', tempContact);
      }

      primaryContactB.linkedId = primaryContactA_ID;
      primaryContactB.linkPrecedence = 'secondary';
      await primaryContactB.save();
      primaryContactID = primaryContactA_ID;
      console.log('Primary contact B updated:', primaryContactB);
    }

    if (primaryContactA_ID && !primaryContactB_ID && phoneNumber) {
      console.log('Creating secondary contact linked to primary contact A');
      let newContact = await Contact.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: primaryContactA_ID,
        linkPrecedence: 'secondary',
      });
      primaryContactID = primaryContactA_ID;
      console.log('New secondary contact created:', newContact);
    }

    if (!primaryContactA_ID && primaryContactB_ID && email) {
      console.log('Creating secondary contact linked to primary contact B');
      let newContact = await Contact.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: primaryContactB_ID,
        linkPrecedence: 'secondary',
      });
      primaryContactID = primaryContactB_ID;
      console.log('New secondary contact created:', newContact);
    }

    if (primaryContactA_ID && primaryContactB_ID && (primaryContactA_ID === primaryContactB_ID)) {
        primaryContactA = await Contact.findByPk(primaryContactA_ID);
        if(primaryContactA.linkPrecedence === 'primary'){
          primaryContactID = primaryContactA_ID
        }else if (primaryContactA.linkPrecedence === 'secondary'){
          primaryContactID = primaryContactA.linkedID
        }

    }

    let primaryContact = await Contact.findByPk(primaryContactID);
    console.log('Primary contact found:', primaryContact);

    const contacts = await Contact.findAll({ where: { linkedId: primaryContact.id } });
    payload.contact.primaryContactId = primaryContact.id;
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

    console.log('Final payload:', payload);
    return res.json(payload);
  } catch (error) {
    console.error('Error in checkDb function:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

module.exports = { validatePayload, checkDb };
