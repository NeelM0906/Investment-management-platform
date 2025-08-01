const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const contactsFilePath = path.join(__dirname, '../../data/contacts.json');

// Helper function to read contacts
const readContacts = () => {
  try {
    if (fs.existsSync(contactsFilePath)) {
      const data = fs.readFileSync(contactsFilePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading contacts:', error);
    return [];
  }
};

// Helper function to write contacts
const writeContacts = (contacts) => {
  try {
    fs.writeFileSync(contactsFilePath, JSON.stringify(contacts, null, 2));
  } catch (error) {
    console.error('Error writing contacts:', error);
    throw error;
  }
};

// GET /api/contacts - Get all contacts with optional filtering
router.get('/', (req, res) => {
  try {
    let contacts = readContacts();
    
    const { search, sortBy, sortOrder } = req.query;
    
    // Apply search filter
    if (search) {
      contacts = contacts.filter(contact => 
        contact.firstName.toLowerCase().includes(search.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(search.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    // Apply sorting
    if (sortBy) {
      contacts.sort((a, b) => {
        const aVal = a[sortBy] || '';
        const bVal = b[sortBy] || '';
        const comparison = aVal.localeCompare(bVal);
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    res.json({
      success: true,
      data: contacts,
      count: contacts.length
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch contacts',
        details: error.message
      }
    });
  }
});

// GET /api/contacts/:id - Get a specific contact
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const contacts = readContacts();
    const contact = contacts.find(c => c.id === id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact not found'
        }
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch contact',
        details: error.message
      }
    });
  }
});

// POST /api/contacts - Create a new contact
router.post('/', (req, res) => {
  try {
    const contactData = req.body;
    const contacts = readContacts();
    
    // Basic validation
    if (!contactData.firstName || !contactData.lastName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'First name and last name are required'
        }
      });
    }
    
    const newContact = {
      id: Date.now().toString(),
      ...contactData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    contacts.push(newContact);
    writeContacts(contacts);

    res.status(201).json({
      success: true,
      data: newContact,
      message: 'Contact created successfully'
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create contact',
        details: error.message
      }
    });
  }
});

// PUT /api/contacts/:id - Update a contact
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const contactData = req.body;
    const contacts = readContacts();
    
    const contactIndex = contacts.findIndex(c => c.id === id);
    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact not found'
        }
      });
    }
    
    const updatedContact = {
      ...contacts[contactIndex],
      ...contactData,
      updatedAt: new Date().toISOString()
    };
    
    contacts[contactIndex] = updatedContact;
    writeContacts(contacts);

    res.json({
      success: true,
      data: updatedContact,
      message: 'Contact updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update contact',
        details: error.message
      }
    });
  }
});

// DELETE /api/contacts/:id - Delete a contact
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const contacts = readContacts();
    
    const contactIndex = contacts.findIndex(c => c.id === id);
    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact not found'
        }
      });
    }
    
    contacts.splice(contactIndex, 1);
    writeContacts(contacts);

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete contact',
        details: error.message
      }
    });
  }
});

// GET /api/contacts/search/:term - Search contacts
router.get('/search/:term', (req, res) => {
  try {
    const { term } = req.params;
    const contacts = readContacts();
    
    const filteredContacts = contacts.filter(contact => 
      contact.firstName.toLowerCase().includes(term.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(term.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(term.toLowerCase()))
    );

    res.json({
      success: true,
      data: filteredContacts,
      count: filteredContacts.length
    });
  } catch (error) {
    console.error('Error searching contacts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: 'Failed to search contacts',
        details: error.message
      }
    });
  }
});

module.exports = router;