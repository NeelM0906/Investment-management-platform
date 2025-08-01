/**
 * Enhanced URL validation utilities for Deal Room components
 */

export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  error?: string;
  warning?: string;
}

/**
 * Validates and normalizes a URL
 */
export const validateAndNormalizeUrl = (url: string): UrlValidationResult => {
  if (!url || url.trim().length === 0) {
    return {
      isValid: false,
      normalizedUrl: '',
      error: 'URL is required'
    };
  }

  const trimmedUrl = url.trim();

  // Check for common URL patterns
  // const urlPatterns = [
  //   /^https?:\/\/.+/i, // Already has protocol
  //   /^www\..+/i,       // Starts with www
  //   /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}.*$/i // Domain pattern
  // ];

  let normalizedUrl = trimmedUrl;

  // Check if URL already has a protocol
  if (normalizedUrl.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//)) {
    // URL already has protocol, validate it
    try {
      const urlObj = new URL(normalizedUrl);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          isValid: false,
          normalizedUrl: trimmedUrl,
          error: 'Only HTTP and HTTPS URLs are allowed'
        };
      }
    } catch {
      return {
        isValid: false,
        normalizedUrl: trimmedUrl,
        error: 'Please enter a valid URL format'
      };
    }
  } else {
    // Add protocol if missing
    if (normalizedUrl.match(/^www\./i)) {
      normalizedUrl = `https://${normalizedUrl}`;
    } else if (normalizedUrl.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}.*$/i)) {
      normalizedUrl = `https://${normalizedUrl}`;
    } else {
      return {
        isValid: false,
        normalizedUrl: trimmedUrl,
        error: 'Please enter a valid URL (e.g., https://example.com or www.example.com)'
      };
    }
  }

  // Validate the normalized URL
  try {
    const urlObj = new URL(normalizedUrl);
    
    // Check for valid protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        normalizedUrl: trimmedUrl,
        error: 'Only HTTP and HTTPS URLs are allowed'
      };
    }

    // Check for valid hostname
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return {
        isValid: false,
        normalizedUrl: trimmedUrl,
        error: 'URL must have a valid domain name'
      };
    }

    // Check for localhost or IP addresses (warning, not error)
    const isLocalhost = urlObj.hostname === 'localhost' || 
                       urlObj.hostname.startsWith('127.');

    const isPrivateIp = urlObj.hostname.startsWith('192.168.') ||
                       urlObj.hostname.startsWith('10.') ||
                       urlObj.hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);

    const isIpAddress = urlObj.hostname.match(/^\d+\.\d+\.\d+\.\d+$/);

    let warning: string | undefined;
    if (isLocalhost || isPrivateIp) {
      warning = 'This appears to be a local URL that may not be accessible to investors';
    } else if (isIpAddress) {
      warning = 'Consider using a domain name instead of an IP address for better accessibility';
    }

    return {
      isValid: true,
      normalizedUrl,
      warning
    };

  } catch (error) {
    return {
      isValid: false,
      normalizedUrl: trimmedUrl,
      error: 'Please enter a valid URL format'
    };
  }
};

/**
 * Extracts domain name from URL for display purposes
 */
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

/**
 * Checks if URL is likely to be accessible (basic check)
 */
export const checkUrlAccessibility = async (url: string): Promise<{
  isAccessible: boolean;
  error?: string;
}> => {
  try {
    // Note: In a real application, this would be done server-side
    // due to CORS restrictions. For now, we'll do basic validation.
    const urlObj = new URL(url);
    
    // Basic checks
    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
      return {
        isAccessible: false,
        error: 'Only HTTP and HTTPS URLs are supported'
      };
    }

    // For demo purposes, we'll assume the URL is accessible
    // In production, you'd want to implement a server-side endpoint
    // that can actually test the URL accessibility
    return {
      isAccessible: true
    };

  } catch (error) {
    return {
      isAccessible: false,
      error: 'Invalid URL format'
    };
  }
};

/**
 * Common URL validation patterns for different types of links
 */
export const urlPatterns = {
  general: /^https?:\/\/.+/i,
  document: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i,
  image: /\.(jpg|jpeg|png|gif|webp|svg)$/i,
  video: /\.(mp4|avi|mov|wmv|flv|webm)$/i,
  social: {
    linkedin: /linkedin\.com/i,
    twitter: /twitter\.com|x\.com/i,
    facebook: /facebook\.com/i,
    youtube: /youtube\.com|youtu\.be/i
  }
};

/**
 * Suggests URL type based on the URL pattern
 */
export const suggestUrlType = (url: string): string | null => {
  if (urlPatterns.document.test(url)) return 'Document';
  if (urlPatterns.image.test(url)) return 'Image';
  if (urlPatterns.video.test(url)) return 'Video';
  if (urlPatterns.social.linkedin.test(url)) return 'LinkedIn';
  if (urlPatterns.social.twitter.test(url)) return 'Twitter/X';
  if (urlPatterns.social.facebook.test(url)) return 'Facebook';
  if (urlPatterns.social.youtube.test(url)) return 'YouTube';
  return null;
};