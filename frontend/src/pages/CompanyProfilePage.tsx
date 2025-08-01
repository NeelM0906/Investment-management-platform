import React, { useState, useEffect } from 'react';
import { Building2, Mail, MapPin, Phone, Save, X, Edit3 } from 'lucide-react';

interface CompanyProfile {
  id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CompanyProfileFormData {
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phoneNumber: string;
}

const CompanyProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [formData, setFormData] = useState<CompanyProfileFormData>({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    phoneNumber: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/api/company-profile');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.success && result.data) {
        setProfile(result.data);
        setFormData({
          name: result.data.name,
          email: result.data.email,
          address: result.data.address,
          city: result.data.city,
          state: result.data.state,
          country: result.data.country,
          zipCode: result.data.zipCode,
          phoneNumber: result.data.phoneNumber
        });
      } else {
        // No profile exists yet, start in editing mode with empty values
        setIsEditing(true);
        setFormData({
          name: '',
          email: '',
          address: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          phoneNumber: ''
        });
      }
    } catch (err) {
      // Start in editing mode even if server is not available
      setIsEditing(true);
      setFormData({
        name: '',
        email: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        phoneNumber: ''
      });
      console.error('Error fetching profile:', err);
      // Only show error if it's a real connection issue
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        setError('Server is not running. Please start the server with "npm run dev" or "npm start"');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Company name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      errors.state = 'State/Province is required';
    }

    if (!formData.country.trim()) {
      errors.country = 'Country is required';
    }

    if (!formData.zipCode.trim()) {
      errors.zipCode = 'ZIP/Postal code is required';
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const url = profile ? `http://localhost:3001/api/company-profile/${profile.id}` : 'http://localhost:3001/api/company-profile';
      const method = profile ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setProfile(result.data);
        setIsEditing(false);
        setError(null);
      } else {
        setError(result.error?.message || 'Failed to save company profile');
      }
    } catch (err) {
      setError('Failed to save company profile');
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      // Reset form to current profile data
      setFormData({
        name: profile.name,
        email: profile.email,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        zipCode: profile.zipCode,
        phoneNumber: profile.phoneNumber
      });
    }
    setIsEditing(false);
    setValidationErrors({});
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Loading company profile...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <Building2 className="page-icon" />
          <div>
            <h1 className="page-title">Company Profile</h1>
            <p className="page-subtitle">Manage your company information and contact details</p>
          </div>
        </div>
        {!isEditing && profile && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary"
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="company-profile-form">
        <div className="form-section">
          <h2 className="section-title">Company Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Company Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${validationErrors.name ? 'error' : ''}`}
                placeholder="Enter company name"
              />
              {validationErrors.name && (
                <span className="error-text">{validationErrors.name}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${validationErrors.email ? 'error' : ''}`}
                placeholder="Enter email address"
              />
              {validationErrors.email && (
                <span className="error-text">{validationErrors.email}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phoneNumber" className="form-label">
                <Phone size={16} />
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${validationErrors.phoneNumber ? 'error' : ''}`}
                placeholder="Enter phone number"
              />
              {validationErrors.phoneNumber && (
                <span className="error-text">{validationErrors.phoneNumber}</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">
            <MapPin size={20} />
            Address Information
          </h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${validationErrors.address ? 'error' : ''}`}
                placeholder="Enter street address"
              />
              {validationErrors.address && (
                <span className="error-text">{validationErrors.address}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city" className="form-label">
                City *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${validationErrors.city ? 'error' : ''}`}
                placeholder="Enter city"
              />
              {validationErrors.city && (
                <span className="error-text">{validationErrors.city}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="state" className="form-label">
                State/Province *
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${validationErrors.state ? 'error' : ''}`}
                placeholder="Enter state/province"
              />
              {validationErrors.state && (
                <span className="error-text">{validationErrors.state}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country" className="form-label">
                Country *
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${validationErrors.country ? 'error' : ''}`}
                placeholder="Enter country"
              />
              {validationErrors.country && (
                <span className="error-text">{validationErrors.country}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="zipCode" className="form-label">
                ZIP/Postal Code *
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`form-input ${validationErrors.zipCode ? 'error' : ''}`}
                placeholder="Enter ZIP/postal code"
              />
              {validationErrors.zipCode && (
                <span className="error-text">{validationErrors.zipCode}</span>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="form-actions">
            <button
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={isSaving}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={isSaving}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfilePage;