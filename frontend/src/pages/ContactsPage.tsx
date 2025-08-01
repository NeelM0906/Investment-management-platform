import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import ContactForm from '../components/ContactForm';
import ConfirmationDialog from '../components/ConfirmationDialog';
import './ContactsPage.css';

interface Contact {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  fax?: string;
  createdAt: string;
  updatedAt: string;
}

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch contacts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      fetchContacts();
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/contacts?search=${encodeURIComponent(term)}`);
      if (!response.ok) {
        throw new Error('Failed to search contacts');
      }
      
      const data = await response.json();
      if (data.success) {
        setContacts(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    }
  };

  const handleCreateContact = () => {
    setEditingContact(null);
    setShowContactForm(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
  };

  const handleDeleteContact = (contact: Contact) => {
    setContactToDelete(contact);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;

    try {
      const response = await fetch(`http://localhost:3001/api/contacts/${contactToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      const data = await response.json();
      if (data.success) {
        setContacts(contacts.filter(c => c.id !== contactToDelete.id));
        setShowDeleteDialog(false);
        setContactToDelete(null);
      } else {
        throw new Error(data.error?.message || 'Failed to delete contact');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleFormSubmit = async (contactData: any) => {
    try {
      const url = editingContact 
        ? `http://localhost:3001/api/contacts/${editingContact.id}`
        : 'http://localhost:3001/api/contacts';
      
      const method = editingContact ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        throw new Error('Failed to save contact');
      }

      const data = await response.json();
      if (data.success) {
        if (editingContact) {
          setContacts(contacts.map(c => c.id === editingContact.id ? data.data : c));
        } else {
          setContacts([...contacts, data.data]);
        }
        setShowContactForm(false);
        setEditingContact(null);
      } else {
        throw new Error(data.error?.message || 'Failed to save contact');
      }
    } catch (err) {
      throw err; // Let the form handle the error
    }
  };

  const getFullName = (contact: Contact) => {
    const parts = [contact.firstName];
    if (contact.middleName) parts.push(contact.middleName);
    parts.push(contact.lastName);
    return parts.join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="contacts-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contacts-page">
      {/* Header */}
      <div className="contacts-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Contacts</h1>
            <p className="contacts-count">{contacts.length} contact{contacts.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={handleCreateContact} className="create-contact-btn">
            <Plus size={20} />
            Add Contact
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="contacts-search">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {/* Contacts List */}
      <div className="contacts-content">
        {contacts.length === 0 ? (
          <div className="empty-state">
            <User size={48} className="empty-icon" />
            <h3>No contacts found</h3>
            <p>
              {searchTerm 
                ? 'No contacts match your search criteria.' 
                : 'Get started by adding your first contact.'
              }
            </p>
            {!searchTerm && (
              <button onClick={handleCreateContact} className="empty-action-btn">
                <Plus size={20} />
                Add Your First Contact
              </button>
            )}
          </div>
        ) : (
          <div className="contacts-table-container">
            <table className="contacts-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Fax</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="contact-name">
                      <div className="name-cell">
                        <div className="contact-avatar">
                          {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                        </div>
                        <div className="name-info">
                          <div className="full-name">{getFullName(contact)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="contact-email">
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} className="email-link">
                          {contact.email}
                        </a>
                      ) : (
                        <span className="no-data">—</span>
                      )}
                    </td>
                    <td className="contact-phone">
                      {contact.phoneNumber ? (
                        <a href={`tel:${contact.phoneNumber}`} className="phone-link">
                          {contact.phoneNumber}
                        </a>
                      ) : (
                        <span className="no-data">—</span>
                      )}
                    </td>
                    <td className="contact-fax">
                      {contact.fax || <span className="no-data">—</span>}
                    </td>
                    <td className="contact-date">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="contact-actions">
                      <button
                        onClick={() => handleEditContact(contact)}
                        className="action-btn edit-btn"
                        title="Edit contact"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact)}
                        className="action-btn delete-btn"
                        title="Delete contact"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm
          contact={editingContact}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowContactForm(false);
            setEditingContact(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && contactToDelete && (
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          title="Delete Contact"
          message={`Are you sure you want to delete ${getFullName(contactToDelete)}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteDialog(false);
            setContactToDelete(null);
          }}
          type="danger"
        />
      )}
    </div>
  );
};

export default ContactsPage;