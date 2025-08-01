"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const ContactRepository_1 = require("../repositories/ContactRepository");
const joi_1 = __importDefault(require("joi"));
class ContactService {
    constructor() {
        this.contactRepository = new ContactRepository_1.ContactRepository();
    }
    async getAllContacts(filters) {
        return await this.contactRepository.findAll(filters);
    }
    async getContact(id) {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Contact ID is required');
        }
        const contact = await this.contactRepository.findById(id);
        if (!contact) {
            throw new Error('Contact not found');
        }
        return contact;
    }
    async createContact(contactData) {
        await this.validateContactData(contactData);
        if (contactData.email) {
            const existingContacts = await this.contactRepository.findAll();
            const duplicateEmail = existingContacts.find(contact => contact.email && contact.email.toLowerCase() === contactData.email.toLowerCase());
            if (duplicateEmail) {
                throw new Error('A contact with this email address already exists');
            }
        }
        return await this.contactRepository.create(contactData);
    }
    async updateContact(id, contactData) {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Contact ID is required');
        }
        if (Object.keys(contactData).length > 0) {
            await this.validateContactData(contactData, true);
        }
        if (contactData.email) {
            const existingContacts = await this.contactRepository.findAll();
            const duplicateEmail = existingContacts.find(contact => contact.id !== id &&
                contact.email &&
                contact.email.toLowerCase() === contactData.email.toLowerCase());
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
    async deleteContact(id) {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Contact ID is required');
        }
        const deleted = await this.contactRepository.delete(id);
        if (!deleted) {
            throw new Error('Contact not found');
        }
    }
    async getContactsCount() {
        return await this.contactRepository.count();
    }
    async searchContacts(searchTerm) {
        if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
            return await this.getAllContacts();
        }
        return await this.contactRepository.findAll({ search: searchTerm.trim() });
    }
    async validateContactData(contactData, isUpdate = false) {
        const schema = joi_1.default.object({
            firstName: isUpdate ? joi_1.default.string().min(1).max(50) : joi_1.default.string().min(1).max(50).required(),
            middleName: joi_1.default.string().max(50).allow('', null),
            lastName: isUpdate ? joi_1.default.string().min(1).max(50) : joi_1.default.string().min(1).max(50).required(),
            email: joi_1.default.string().email().max(100).allow('', null),
            phoneNumber: joi_1.default.string().max(20).allow('', null),
            fax: joi_1.default.string().max(20).allow('', null)
        });
        const { error } = schema.validate(contactData);
        if (error) {
            throw new Error(`Validation failed: ${error.details[0].message}`);
        }
    }
}
exports.ContactService = ContactService;
//# sourceMappingURL=ContactService.js.map