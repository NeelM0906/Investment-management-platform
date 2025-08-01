import { Contact, ContactFormData, ContactFilters } from '../models/Contact';
import { FileStorage } from '../utils/fileStorage';
import { v4 as uuidv4 } from 'uuid';

export class ContactRepository {
  private fileStorage: FileStorage<Contact>;

  constructor() {
    this.fileStorage = new FileStorage<Contact>('data/contacts.json');
  }

  async findAll(filters?: ContactFilters): Promise<Contact[]> {
    let contacts = await this.fileStorage.readAll();

    // Apply search filter
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      contacts = contacts.filter(contact => 
        contact.firstName.toLowerCase().includes(searchTerm) ||
        contact.lastName.toLowerCase().includes(searchTerm) ||
        (contact.middleName && contact.middleName.toLowerCase().includes(searchTerm)) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm)) ||
        (contact.phoneNumber && contact.phoneNumber.includes(searchTerm))
      );
    }

    // Apply sorting
    if (filters?.sortBy) {
      contacts.sort((a, b) => {
        const aValue = a[filters.sortBy!] || '';
        const bValue = b[filters.sortBy!] || '';
        
        if (filters.sortOrder === 'desc') {
          return bValue.localeCompare(aValue);
        }
        return aValue.localeCompare(bValue);
      });
    } else {
      // Default sort by lastName, then firstName
      contacts.sort((a, b) => {
        const lastNameCompare = a.lastName.localeCompare(b.lastName);
        if (lastNameCompare !== 0) return lastNameCompare;
        return a.firstName.localeCompare(b.firstName);
      });
    }

    return contacts;
  }

  async findById(id: string): Promise<Contact | null> {
    const contacts = await this.fileStorage.readAll();
    return contacts.find(contact => contact.id === id) || null;
  }

  async create(contactData: ContactFormData): Promise<Contact> {
    const contacts = await this.fileStorage.readAll();
    
    const newContact: Contact = {
      id: uuidv4(),
      ...contactData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    contacts.push(newContact);
    await this.fileStorage.writeAll(contacts);
    
    return newContact;
  }

  async update(id: string, contactData: Partial<ContactFormData>): Promise<Contact | null> {
    const contacts = await this.fileStorage.readAll();
    const contactIndex = contacts.findIndex(contact => contact.id === id);
    
    if (contactIndex === -1) {
      return null;
    }

    const updatedContact: Contact = {
      ...contacts[contactIndex],
      ...contactData,
      updatedAt: new Date().toISOString()
    };

    contacts[contactIndex] = updatedContact;
    await this.fileStorage.writeAll(contacts);
    
    return updatedContact;
  }

  async delete(id: string): Promise<boolean> {
    const contacts = await this.fileStorage.readAll();
    const contactIndex = contacts.findIndex(contact => contact.id === id);
    
    if (contactIndex === -1) {
      return false;
    }

    contacts.splice(contactIndex, 1);
    await this.fileStorage.writeAll(contacts);
    
    return true;
  }

  async count(): Promise<number> {
    const contacts = await this.fileStorage.readAll();
    return contacts.length;
  }
}