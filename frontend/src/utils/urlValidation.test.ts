import {
  validateAndNormalizeUrl,
  extractDomain,
  suggestUrlType,
  checkUrlAccessibility
} from './urlValidation';

describe('URL Validation Utilities', () => {
  describe('validateAndNormalizeUrl', () => {
    it('validates and normalizes valid URLs with protocol', () => {
      const result = validateAndNormalizeUrl('https://example.com');
      expect(result.isValid).toBe(true);
      expect(result.normalizedUrl).toBe('https://example.com');
      expect(result.error).toBeUndefined();
    });

    it('adds https protocol to URLs without protocol', () => {
      const result = validateAndNormalizeUrl('example.com');
      expect(result.isValid).toBe(true);
      expect(result.normalizedUrl).toBe('https://example.com');
    });

    it('adds https protocol to www URLs', () => {
      const result = validateAndNormalizeUrl('www.example.com');
      expect(result.isValid).toBe(true);
      expect(result.normalizedUrl).toBe('https://www.example.com');
    });

    it('rejects empty URLs', () => {
      const result = validateAndNormalizeUrl('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('URL is required');
    });

    it('rejects invalid URL formats', () => {
      const result = validateAndNormalizeUrl('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('valid URL');
    });

    it('warns about localhost URLs', () => {
      const result = validateAndNormalizeUrl('http://localhost:3000');
      expect(result.isValid).toBe(true);
      expect(result.warning).toContain('local URL');
    });

    it('warns about IP addresses', () => {
      const result = validateAndNormalizeUrl('http://8.8.8.8');
      expect(result.isValid).toBe(true);
      expect(result.warning).toContain('domain name');
    });

    it('rejects non-HTTP protocols', () => {
      const result = validateAndNormalizeUrl('ftp://example.com');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('HTTP and HTTPS');
    });

    it('handles URLs with paths and parameters', () => {
      const result = validateAndNormalizeUrl('https://example.com/path?param=value');
      expect(result.isValid).toBe(true);
      expect(result.normalizedUrl).toBe('https://example.com/path?param=value');
    });
  });

  describe('extractDomain', () => {
    it('extracts domain from valid URL', () => {
      const domain = extractDomain('https://www.example.com/path');
      expect(domain).toBe('www.example.com');
    });

    it('returns original string for invalid URL', () => {
      const domain = extractDomain('not-a-url');
      expect(domain).toBe('not-a-url');
    });

    it('handles URLs with ports', () => {
      const domain = extractDomain('https://example.com:8080/path');
      expect(domain).toBe('example.com');
    });
  });

  describe('suggestUrlType', () => {
    it('detects document URLs', () => {
      expect(suggestUrlType('https://example.com/document.pdf')).toBe('Document');
      expect(suggestUrlType('https://example.com/file.docx')).toBe('Document');
      expect(suggestUrlType('https://example.com/sheet.xlsx')).toBe('Document');
    });

    it('detects image URLs', () => {
      expect(suggestUrlType('https://example.com/image.jpg')).toBe('Image');
      expect(suggestUrlType('https://example.com/photo.png')).toBe('Image');
      expect(suggestUrlType('https://example.com/graphic.svg')).toBe('Image');
    });

    it('detects video URLs', () => {
      expect(suggestUrlType('https://example.com/video.mp4')).toBe('Video');
      expect(suggestUrlType('https://example.com/movie.avi')).toBe('Video');
    });

    it('detects social media URLs', () => {
      expect(suggestUrlType('https://linkedin.com/company/example')).toBe('LinkedIn');
      expect(suggestUrlType('https://twitter.com/example')).toBe('Twitter/X');
      expect(suggestUrlType('https://x.com/example')).toBe('Twitter/X');
      expect(suggestUrlType('https://facebook.com/example')).toBe('Facebook');
      expect(suggestUrlType('https://youtube.com/watch?v=123')).toBe('YouTube');
      expect(suggestUrlType('https://youtu.be/123')).toBe('YouTube');
    });

    it('returns null for generic URLs', () => {
      expect(suggestUrlType('https://example.com')).toBeNull();
      expect(suggestUrlType('https://example.com/page.html')).toBeNull();
    });
  });

  describe('checkUrlAccessibility', () => {
    it('accepts valid HTTP/HTTPS URLs', async () => {
      const result = await checkUrlAccessibility('https://example.com');
      expect(result.isAccessible).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects non-HTTP protocols', async () => {
      const result = await checkUrlAccessibility('ftp://example.com');
      expect(result.isAccessible).toBe(false);
      expect(result.error).toContain('HTTP and HTTPS');
    });

    it('handles invalid URL formats', async () => {
      const result = await checkUrlAccessibility('not-a-url');
      expect(result.isAccessible).toBe(false);
      expect(result.error).toBe('Invalid URL format');
    });
  });
});