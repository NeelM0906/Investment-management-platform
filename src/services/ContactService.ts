import { Contact, ContactFormData, ContactFilters } from '../models/Contact';
import { ContactRepository } from '../repositories/ContactRepository';
import Joi from 'joi';

export class ContactService {
  private contactRepository: ContactRepository;

  constructor() {
    this.contactRepository = new ContactRepository();
  }

  async getAllContacts(filters?: ContactFilters): Promise<Contact[]> {
    return await this.contactRepository.findAll(filters);
  }

  async getContact(id: string): Promise<Contact> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Contact ID is required');
    }

    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }

    return contact;
  }

  async createContact(contactData: ContactFormData): Promise<Contact> {
    // Validate input data
    await this.validateContactData(contactData);

    // Check for duplicate email if provided
    if (contactData.email) {
      const existingContacts = await this.contactRepository.findAll();
      const duplicateEmail = existingContacts.find(
        contact => contact.email && contact.email.toLowerCase() === contactData.email!.toLowerCase()
      );
      
      if (duplicateEmail) {
        throw new Error('A contact with this email address already exists');
      }
    }

    return await this.contactRepository.create(contactData);
  }

  async updateContact(id: string, contactData: Partial<ContactFormData>): Promise<Contact> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Contact ID is required');
    }

    // Validate input data
    if (Object.keys(contactData).length > 0) {
      await this.validateContactData(contactData, true);
    }

    // Check for duplicate email if provided and different from current
    if (contactData.email) {
      const existingContacts = await this.contactRepository.findAll();
      const duplicateEmail = existingContacts.find(
        contact => contact.id !== id && 
        contact.email && 
        contact.email.toLowerCase() === contactData.email!.toLowerCase()
      );
      
      if (duplicateEmail) {
        throw new Error('A contact with this email address already exists');
      }
    }

    const updatedContact = await this.contactRepository.update(id, contactData);
    if (!updatedContact) {
      throw new Error('Contact not found');
    }

    return updatedContact;
  }

  async deleteContact(id: string): Promise<void> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Contact ID is required');
    }

    const deleted = await this.contactRepository.delete(id);
    if (!deleted) {
      throw new Error('Contact not found');
    }
  }

  async getContactsCount(): Promise<number> {
    return await this.contactRepository.count();
  }

  async searchContacts(searchTerm: string): Promise<Contact[]> {
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
      return await this.getAllContacts();
    }

    return await this.contactRepository.findAll({ search: searchTerm.trim() });
  }

  private async validateContactData(contactData: Partial<ContactFormData>, isUpdate: boolean = false): Promise<void> {
    const schema = Joi.object({
      firstName: isUpdate ? Joi.string().min(1).max(50) : Joi.string().min(1).max(50).required(),
      middleName: Joi.string().max(50).allow('', null),
      lastName: isUpdate ? Joi.string().min(1).max(50) : Joi.string().min(1).max(50).required(),
      email: Joi.string().email().max(100).allow('', null),
      phoneNumber: Joi.string().max(20).allow('', null),
      fax: Joi.string().max(20).allow('', null)
    });

    const { error } = schema.validate(contactData);
    if (error) {
      throw new Error(`Validation failed: ${error.details[0].message}`);
    }
  }
}