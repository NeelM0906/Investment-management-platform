import { Contact, ContactFormData, ContactFilters } from '../models/Contact';
export declare class ContactRepository {
    private fileStorage;
    constructor();
    findAll(filters?: ContactFilters): Promise<Contact[]>;
    findById(id: string): Promise<Contact | null>;
    create(contactData: ContactFormData): Promise<Contact>;
    update(id: string, contactData: Partial<ContactFormData>): Promise<Contact | null>;
    delete(id: string): Promise<boolean>;
    count(): Promise<number>;
}
//# sourceMappingURL=ContactRepository.d.ts.map