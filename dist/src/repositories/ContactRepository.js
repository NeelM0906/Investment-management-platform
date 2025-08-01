"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRepository = void 0;
const fileStorage_1 = require("../utils/fileStorage");
const uuid_1 = require("uuid");
class ContactRepository {
    constructor() {
        this.fileStorage = new fileStorage_1.FileStorage('data/contacts.json');
    }
    async findAll(filters) {
        let contacts = await this.fileStorage.readAll();
        if (filters?.search) {
            const searchTerm = filters.search.toLowerCase();
            contacts = contacts.filter(contact => contact.firstName.toLowerCase().includes(searchTerm) ||
                contact.lastName.toLowerCase().includes(searchTerm) ||
                (contact.middleName && contact.middleName.toLowerCase().includes(searchTerm)) ||
                (contact.email && contact.email.toLowerCase().includes(searchTerm)) ||
                (contact.phoneNumber && contact.phoneNumber.includes(searchTerm)));
        }
        if (filters?.sortBy) {
            contacts.sort((a, b) => {
                const aValue = a[filters.sortBy] || '';
                const bValue = b[filters.sortBy] || '';
                if (filters.sortOrder === 'desc') {
                    return bValue.localeCompare(aValue);
                }
                return aValue.localeCompare(bValue);
            });
        }
        else {
            contacts.sort((a, b) => {
                const lastNameCompare = a.lastName.localeCompare(b.lastName);
                if (lastNameCompare !== 0)
                    return lastNameCompare;
                return a.firstName.localeCompare(b.firstName);
            });
        }
        return contacts;
    }
    async findById(id) {
        const contacts = await this.fileStorage.readAll();
        return contacts.find(contact => contact.id === id) || null;
    }
    async create(contactData) {
        const contacts = await this.fileStorage.readAll();
        const newContact = {
            id: (0, uuid_1.v4)(),
            ...contactData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        contacts.push(newContact);
        await this.fileStorage.writeAll(contacts);
        return newContact;
    }
    async update(id, contactData) {
        const contacts = await this.fileStorage.readAll();
        const contactIndex = contacts.findIndex(contact => contact.id === id);
        if (contactIndex === -1) {
            return null;
        }
        const updatedContact = {
            ...contacts[contactIndex],
            ...contactData,
            updatedAt: new Date().toISOString()
        };
        contacts[contactIndex] = updatedContact;
        await this.fileStorage.writeAll(contacts);
        return updatedContact;
    }
    async delete(id) {
        const contacts = await this.fileStorage.readAll();
        const contactIndex = contacts.findIndex(contact => contact.id === id);
        if (contactIndex === -1) {
            return false;
        }
        contacts.splice(contactIndex, 1);
        await this.fileStorage.writeAll(contacts);
        return true;
    }
    async count() {
        const contacts = await this.fileStorage.readAll();
        return contacts.length;
    }
}
exports.ContactRepository = ContactRepository;
//# sourceMappingURL=ContactRepository.js.map