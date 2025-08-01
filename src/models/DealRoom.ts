export interface DealRoom {
  id: string;
  projectId: string;
  showcasePhoto?: ShowcasePhoto;
  investmentBlurb: string;
  investmentSummary: string;
  keyInfo: KeyInfoItem[];
  externalLinks: ExternalLink[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShowcasePhoto {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
}

export interface KeyInfoItem {
  id: string;
  name: string;
  link: string;
  order: number;
}

export interface ExternalLink {
  id: string;
  name: string;
  url: string;
  order: number;
}

export interface DealRoomFormData {
  showcasePhoto?: File;
  investmentBlurb: string;
  investmentSummary: string;
  keyInfo: Omit<KeyInfoItem, 'id'>[];
  externalLinks: Omit<ExternalLink, 'id'>[];
}

export interface DealRoomCreateData {
  projectId: string;
  showcasePhoto?: ShowcasePhoto;
  investmentBlurb: string;
  investmentSummary: string;
  keyInfo: Omit<KeyInfoItem, 'id'>[];
  externalLinks: Omit<ExternalLink, 'id'>[];
}

export interface DealRoomUpdateData {
  showcasePhoto?: ShowcasePhoto;
  investmentBlurb?: string;
  investmentSummary?: string;
  keyInfo?: Omit<KeyInfoItem, 'id'>[];
  externalLinks?: Omit<ExternalLink, 'id'>[];
}

export class DealRoomModel {
  static validate(data: Partial<DealRoomCreateData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate project ID
    if (!data.projectId || typeof data.projectId !== 'string' || data.projectId.trim() === '') {
      errors.push('Project ID is required');
    }

    // Validate investment blurb
    if (data.investmentBlurb !== undefined) {
      if (typeof data.investmentBlurb !== 'string') {
        errors.push('Investment blurb must be a string');
      } else if (data.investmentBlurb.length > 500) {
        errors.push('Investment blurb must be less than 500 characters');
      }
    }

    // Validate investment summary
    if (data.investmentSummary !== undefined) {
      if (typeof data.investmentSummary !== 'string') {
        errors.push('Investment summary must be a string');
      } else if (data.investmentSummary.length > 10000) {
        errors.push('Investment summary must be less than 10,000 characters');
      }
    }

    // Validate key info items
    if (data.keyInfo) {
      if (!Array.isArray(data.keyInfo)) {
        errors.push('Key info must be an array');
      } else {
        data.keyInfo.forEach((item, index) => {
          if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
            errors.push(`Key info item ${index + 1}: Name is required`);
          }
          if (!item.link || typeof item.link !== 'string' || item.link.trim() === '') {
            errors.push(`Key info item ${index + 1}: Link is required`);
          } else if (!this.isValidUrl(item.link)) {
            errors.push(`Key info item ${index + 1}: Link must be a valid URL`);
          }
          if (typeof item.order !== 'number' || item.order < 0) {
            errors.push(`Key info item ${index + 1}: Order must be a non-negative number`);
          }
        });
      }
    }

    // Validate external links
    if (data.externalLinks) {
      if (!Array.isArray(data.externalLinks)) {
        errors.push('External links must be an array');
      } else {
        data.externalLinks.forEach((link, index) => {
          if (!link.name || typeof link.name !== 'string' || link.name.trim() === '') {
            errors.push(`External link ${index + 1}: Name is required`);
          }
          if (!link.url || typeof link.url !== 'string' || link.url.trim() === '') {
            errors.push(`External link ${index + 1}: URL is required`);
          } else if (!this.isValidUrl(link.url)) {
            errors.push(`External link ${index + 1}: URL must be a valid URL`);
          }
          if (typeof link.order !== 'number' || link.order < 0) {
            errors.push(`External link ${index + 1}: Order must be a non-negative number`);
          }
        });
      }
    }

    // Validate showcase photo
    if (data.showcasePhoto) {
      const photo = data.showcasePhoto;
      if (!photo.filename || typeof photo.filename !== 'string') {
        errors.push('Showcase photo filename is required');
      }
      if (!photo.originalName || typeof photo.originalName !== 'string') {
        errors.push('Showcase photo original name is required');
      }
      if (!photo.mimeType || typeof photo.mimeType !== 'string') {
        errors.push('Showcase photo MIME type is required');
      } else if (!this.isValidImageMimeType(photo.mimeType)) {
        errors.push('Showcase photo must be a valid image format (JPEG, PNG, WebP)');
      }
      if (typeof photo.size !== 'number' || photo.size <= 0) {
        errors.push('Showcase photo size must be a positive number');
      }
      if (!(photo.uploadedAt instanceof Date)) {
        errors.push('Showcase photo upload date is required');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidImageMimeType(mimeType: string): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(mimeType.toLowerCase());
  }

  static createDefault(projectId: string): DealRoom {
    const now = new Date();
    return {
      id: this.generateId(),
      projectId,
      investmentBlurb: '',
      investmentSummary: '',
      keyInfo: [],
      externalLinks: [],
      createdAt: now,
      updatedAt: now
    };
  }

  static generateId(): string {
    return 'dr_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  static generateItemId(): string {
    return 'item_' + Math.random().toString(36).substr(2, 9);
  }
}