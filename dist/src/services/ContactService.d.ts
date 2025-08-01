import { Contact, ContactFormData, ContactFilters } from '../models/Contact';
export declare class ContactService {
    private contactRepository;
    constructor();
    getAllContacts(filters?: ContactFilters): Promise<Contact[]>;
    getContact(id: string): Promise<Contact>;
    createContact(contactData: ContactFormData): Promise<Contact>;
    updateContact(id: string, contactData: Partial<ContactFormData>): Promise<Contact>;
    deleteContact(id: string): Promise<void>;
    getContactsCount(): Promise<number>;
    searchContacts(searchTerm: string): Promise<Contact[]>;
    private validateContactData;
}
//# sourceMappingURL=ContactService.d.ts.map