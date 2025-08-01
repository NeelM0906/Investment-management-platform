export interface Contact {
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

export interface ContactFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  fax?: string;
}

export interface ContactFilters {
  search?: string;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}