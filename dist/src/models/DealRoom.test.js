"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DealRoom_1 = require("./DealRoom");
describe('DealRoomModel', () => {
    describe('validate', () => {
        it('should validate a valid deal room data', () => {
            const validData = {
                projectId: 'project-123',
                investmentBlurb: 'A great investment opportunity',
                investmentSummary: 'This is a comprehensive summary of the investment',
                keyInfo: [
                    { name: 'Prospectus', link: 'https://example.com/prospectus.pdf', order: 0 }
                ],
                externalLinks: [
                    { name: 'Company Website', url: 'https://company.com', order: 0 }
                ]
            };
            const result = DealRoom_1.DealRoomModel.validate(validData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it('should require project ID', () => {
            const invalidData = {
                investmentBlurb: 'Test blurb'
            };
            const result = DealRoom_1.DealRoomModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Project ID is required');
        });
        it('should validate investment blurb length', () => {
            const invalidData = {
                projectId: 'project-123',
                investmentBlurb: 'a'.repeat(501),
                investmentSummary: '',
                keyInfo: [],
                externalLinks: []
            };
            const result = DealRoom_1.DealRoomModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Investment blurb must be less than 500 characters');
        });
        it('should validate investment summary length', () => {
            const invalidData = {
                projectId: 'project-123',
                investmentBlurb: '',
                investmentSummary: 'a'.repeat(10001),
                keyInfo: [],
                externalLinks: []
            };
            const result = DealRoom_1.DealRoomModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Investment summary must be less than 10,000 characters');
        });
        it('should validate key info items', () => {
            const invalidData = {
                projectId: 'project-123',
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [
                    { name: '', link: 'invalid-url', order: -1 }
                ],
                externalLinks: []
            };
            const result = DealRoom_1.DealRoomModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Key info item 1: Name is required');
            expect(result.errors).toContain('Key info item 1: Link must be a valid URL');
            expect(result.errors).toContain('Key info item 1: Order must be a non-negative number');
        });
        it('should validate external links', () => {
            const invalidData = {
                projectId: 'project-123',
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: [
                    { name: '', url: 'not-a-url', order: -1 }
                ]
            };
            const result = DealRoom_1.DealRoomModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('External link 1: Name is required');
            expect(result.errors).toContain('External link 1: URL must be a valid URL');
            expect(result.errors).toContain('External link 1: Order must be a non-negative number');
        });
        it('should validate showcase photo', () => {
            const invalidData = {
                projectId: 'project-123',
                investmentBlurb: '',
                investmentSummary: '',
                keyInfo: [],
                externalLinks: [],
                showcasePhoto: {
                    filename: '',
                    originalName: '',
                    mimeType: 'invalid/type',
                    size: -1,
                    uploadedAt: new Date()
                }
            };
            const result = DealRoom_1.DealRoomModel.validate(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Showcase photo filename is required');
            expect(result.errors).toContain('Showcase photo original name is required');
            expect(result.errors).toContain('Showcase photo must be a valid image format (JPEG, PNG, WebP)');
            expect(result.errors).toContain('Showcase photo size must be a positive number');
        });
    });
    describe('isValidUrl', () => {
        it('should validate correct URLs', () => {
            expect(DealRoom_1.DealRoomModel.isValidUrl('https://example.com')).toBe(true);
            expect(DealRoom_1.DealRoomModel.isValidUrl('http://example.com')).toBe(true);
            expect(DealRoom_1.DealRoomModel.isValidUrl('https://example.com/path?query=1')).toBe(true);
        });
        it('should reject invalid URLs', () => {
            expect(DealRoom_1.DealRoomModel.isValidUrl('not-a-url')).toBe(false);
            expect(DealRoom_1.DealRoomModel.isValidUrl('ftp://example.com')).toBe(true);
            expect(DealRoom_1.DealRoomModel.isValidUrl('')).toBe(false);
            expect(DealRoom_1.DealRoomModel.isValidUrl('example.com')).toBe(false);
        });
    });
    describe('isValidImageMimeType', () => {
        it('should validate correct image MIME types', () => {
            expect(DealRoom_1.DealRoomModel.isValidImageMimeType('image/jpeg')).toBe(true);
            expect(DealRoom_1.DealRoomModel.isValidImageMimeType('image/jpg')).toBe(true);
            expect(DealRoom_1.DealRoomModel.isValidImageMimeType('image/png')).toBe(true);
            expect(DealRoom_1.DealRoomModel.isValidImageMimeType('image/webp')).toBe(true);
            expect(DealRoom_1.DealRoomModel.isValidImageMimeType('IMAGE/JPEG')).toBe(true);
        });
        it('should reject invalid MIME types', () => {
            expect(DealRoom_1.DealRoomModel.isValidImageMimeType('image/gif')).toBe(false);
            expect(DealRoom_1.DealRoomModel.isValidImageMimeType('text/plain')).toBe(false);
            expect(DealRoom_1.DealRoomModel.isValidImageMimeType('application/pdf')).toBe(false);
            expect(DealRoom_1.DealRoomModel.isValidImageMimeType('')).toBe(false);
        });
    });
    describe('createDefault', () => {
        it('should create a default deal room', () => {
            const projectId = 'project-123';
            const dealRoom = DealRoom_1.DealRoomModel.createDefault(projectId);
            expect(dealRoom.projectId).toBe(projectId);
            expect(dealRoom.investmentBlurb).toBe('');
            expect(dealRoom.investmentSummary).toBe('');
            expect(dealRoom.keyInfo).toEqual([]);
            expect(dealRoom.externalLinks).toEqual([]);
            expect(dealRoom.id).toMatch(/^dr_/);
            expect(dealRoom.createdAt).toBeInstanceOf(Date);
            expect(dealRoom.updatedAt).toBeInstanceOf(Date);
        });
    });
    describe('generateId', () => {
        it('should generate unique IDs', () => {
            const id1 = DealRoom_1.DealRoomModel.generateId();
            const id2 = DealRoom_1.DealRoomModel.generateId();
            expect(id1).toMatch(/^dr_/);
            expect(id2).toMatch(/^dr_/);
            expect(id1).not.toBe(id2);
        });
    });
    describe('generateItemId', () => {
        it('should generate unique item IDs', () => {
            const id1 = DealRoom_1.DealRoomModel.generateItemId();
            const id2 = DealRoom_1.DealRoomModel.generateItemId();
            expect(id1).toMatch(/^item_/);
            expect(id2).toMatch(/^item_/);
            expect(id1).not.toBe(id2);
        });
    });
});
//# sourceMappingURL=DealRoom.test.js.map