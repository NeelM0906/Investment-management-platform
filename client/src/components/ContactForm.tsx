import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, FileText } from 'lucide-react';
import './ContactForm.css';

interface Contact {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  fax?: string;
}

interface ContactFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  fax: string;
}

interface ContactFormProps {
  contact?: Contact | null;
  onSubmit: (contactData: ContactFormData) => Promise<void>;
  onClose: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ contact, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    fax: ''
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName || '',
        middleName: contact.middleName || '',
        lastName: contact.lastName || '',
        email: contact.email || '',
        phoneNumber: contact.phoneNumber || '',
        fax: contact.fax || ''
      });
    }
  }, [contact]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'First name must be 50 characters or less';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Last name must be 50 characters or less';
    }

    // Optional field validations
    if (formData.middleName && formData.middleName.length > 50) {
      newErrors.middleName = 'Middle name must be 50 characters or less';
    }

    if (formData.email && formData.email.length > 100) {
      newErrors.email = 'Email must be 100 characters or less';
    } else if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phoneNumber && formData.phoneNumber.length > 20) {
      newErrors.phoneNumber = 'Phone number must be 20 characters or less';
    }

    if (formData.fax && formData.fax.length > 20) {
      newErrors.fax = 'Fax number must be 20 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Clean up form data - remove empty strings for optional fields
      const cleanedData: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };
      
      if (formData.middleName.trim()) cleanedData.middleName = formData.middleName.trim();
      if (formData.email.trim()) cleanedData.email = formData.email.trim();
      if (formData.phoneNumber.trim()) cleanedData.phoneNumber = formData.phoneNumber.trim();
      if (formData.fax.trim()) cleanedData.fax = formData.fax.trim();

      await onSubmit(cleanedData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="contact-form-overlay" onClick={handleOverlayClick}>
      <div className="contact-form-container">
        <div className="contact-form-header">
          <h2>
            <User size={24} />
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <button onClick={onClose} className="close-btn" type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-content">
            {/* Name Fields */}
            <div className="form-section">
              <h3>Name Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={errors.firstName ? 'error' : ''}
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="middleName">Middle Name</label>
                  <input
                    type="text"
                    id="middleName"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                    className={errors.middleName ? 'error' : ''}
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                  {errors.middleName && <span className="error-message">{errors.middleName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={errors.lastName ? 'error' : ''}
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section">
              <h3>Contact Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={16} />
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'error' : ''}
                    maxLength={100}
                    disabled={isSubmitting}
                    placeholder="example@company.com"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={errors.phoneNumber ? 'error' : ''}
                    maxLength={20}
                    disabled={isSubmitting}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="fax">
                    <FileText size={16} />
                    Fax <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="fax"
                    value={formData.fax}
                    onChange={(e) => handleInputChange('fax', e.target.value)}
                    className={errors.fax ? 'error' : ''}
                    maxLength={20}
                    disabled={isSubmitting}
                    placeholder="(555) 123-4567"
                  />
                  {errors.fax && <span className="error-message">{errors.fax}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="submit-error">
              <p>{submitError}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  {contact ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                contact ? 'Update Contact' : 'Create Contact'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;