const express = require('express');
const { ContactService } = require('../../src/services/ContactService');

const router = express.Router();
const contactService = new ContactService();

// GET /api/contacts - Get all contacts with optional filtering
router.get('/', async (req, res) => {
  try {
    const { search, sortBy, sortOrder } = req.query;
    
    const filters = {};
    if (search) filters.search = search;
    if (sortBy) filters.sortBy = sortBy;
    if (sortOrder) filters.sortOrder = sortOrder;

    const contacts = await contactService.getAllContacts(filters);
    
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
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await contactService.getContact(id);
    
    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    
    if (error.message === 'Contact not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact not found'
        }
      });
    } else if (error.message === 'Contact ID is required') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Contact ID is required'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch contact',
          details: error.message
        }
      });
    }
  }
});

// POST /api/contacts - Create a new contact
router.post('/', async (req, res) => {
  try {
    const contactData = req.body;
    const newContact = await contactService.createContact(contactData);
    
    res.status(201).json({
      success: true,
      data: newContact,
      message: 'Contact created successfully'
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    
    if (error.message.includes('Validation failed') || 
        error.message.includes('already exists')) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create contact',
          details: error.message
        }
      });
    }
  }
});

// PUT /api/contacts/:id - Update a contact
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contactData = req.body;
    
    const updatedContact = await contactService.updateContact(id, contactData);
    
    res.json({
      success: true,
      data: updatedContact,
      message: 'Contact updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    
    if (error.message === 'Contact not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact not found'
        }
      });
    } else if (error.message.includes('Validation failed') || 
               error.message.includes('already exists') ||
               error.message === 'Contact ID is required') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update contact',
          details: error.message
        }
      });
    }
  }
});

// DELETE /api/contacts/:id - Delete a contact
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await contactService.deleteContact(id);
    
    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    
    if (error.message === 'Contact not found') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Contact not found'
        }
      });
    } else if (error.message === 'Contact ID is required') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Contact ID is required'
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete contact',
          details: error.message
        }
      });
    }
  }
});

// GET /api/contacts/search/:term - Search contacts
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const contacts = await contactService.searchContacts(term);
    
    res.json({
      success: true,
      data: contacts,
      count: contacts.length
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