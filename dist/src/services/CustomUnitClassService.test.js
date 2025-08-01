"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CustomUnitClassService_1 = require("./CustomUnitClassService");
class MockCustomUnitClassRepository {
    constructor() {
        this.classes = [];
        this.nextId = 1;
    }
    async create(classData) {
        const existingClass = this.classes.find(c => c.name.toLowerCase() === classData.name.toLowerCase());
        if (existingClass) {
            throw new Error('A custom unit class with this name already exists');
        }
        const newClass = {
            id: `custom-${this.nextId++}`,
            ...classData,
            createdAt: new Date()
        };
        this.classes.push(newClass);
        return newClass;
    }
    async findById(id) {
        return this.classes.find(c => c.id === id) || null;
    }
    async findAll() {
        return [...this.classes].sort((a, b) => a.name.localeCompare(b.name));
    }
    async findByName(name) {
        return this.classes.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
    }
    async delete(id) {
        const index = this.classes.findIndex(c => c.id === id);
        if (index === -1)
            return false;
        this.classes.splice(index, 1);
        return true;
    }
    async existsByName(name, excludeId) {
        return this.classes.some(c => c.name.toLowerCase() === name.toLowerCase() &&
            c.id !== excludeId);
    }
    async search(query) {
        const searchTerm = query.toLowerCase();
        return this.classes.filter(c => c.name.toLowerCase().includes(searchTerm)).sort((a, b) => a.name.localeCompare(b.name));
    }
    clear() {
        this.classes = [];
        this.nextId = 1;
    }
    getAll() {
        return [...this.classes];
    }
}
describe('CustomUnitClassService', () => {
    let service;
    let mockRepository;
    const validClassData = {
        name: 'Premium Class'
    };
    beforeEach(() => {
        mockRepository = new MockCustomUnitClassRepository();
        service = new CustomUnitClassService_1.CustomUnitClassService(mockRepository);
    });
    afterEach(() => {
        mockRepository.clear();
    });
    describe('createCustomClass', () => {
        it('should create a new custom unit class with valid data', async () => {
            const result = await service.createCustomClass(validClassData);
            expect(result).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.name).toBe(validClassData.name);
            expect(result.createdAt).toBeDefined();
        });
        it('should throw validation error for empty name', async () => {
            const invalidData = { name: '' };
            await expect(service.createCustomClass(invalidData))
                .rejects.toThrow('Validation failed');
        });
        it('should throw validation error for name too short', async () => {
            const invalidData = { name: 'A' };
            await expect(service.createCustomClass(invalidData))
                .rejects.toThrow('Validation failed');
        });
        it('should throw validation error for name too long', async () => {
            const invalidData = { name: 'A'.repeat(101) };
            await expect(service.createCustomClass(invalidData))
                .rejects.toThrow('Validation failed');
        });
        it('should throw validation error for reserved names', async () => {
            const reservedNames = ['Class A', 'class b', 'DEBT', 'equity'];
            for (const name of reservedNames) {
                await expect(service.createCustomClass({ name }))
                    .rejects.toThrow('Validation failed');
            }
        });
        it('should throw validation error for invalid characters', async () => {
            const invalidData = { name: 'Class@#$%' };
            await expect(service.createCustomClass(invalidData))
                .rejects.toThrow('Validation failed');
        });
        it('should allow valid characters (letters, numbers, spaces, hyphens, underscores)', async () => {
            const validNames = [
                'Class ABC',
                'Class-123',
                'Class_Premium',
                'Class 1A',
                'Premium-Class_2024'
            ];
            for (const name of validNames) {
                const result = await service.createCustomClass({ name });
                expect(result.name).toBe(name);
            }
        });
        it('should throw error for duplicate names (case-insensitive)', async () => {
            await service.createCustomClass(validClassData);
            await expect(service.createCustomClass({ name: 'PREMIUM CLASS' }))
                .rejects.toThrow('already exists');
        });
        it('should trim whitespace from names', async () => {
            const dataWithSpaces = { name: '  Premium Class  ' };
            const result = await service.createCustomClass(dataWithSpaces);
            expect(result.name).toBe('Premium Class');
        });
    });
    describe('getCustomClass', () => {
        it('should retrieve existing custom class by ID', async () => {
            const created = await service.createCustomClass(validClassData);
            const retrieved = await service.getCustomClass(created.id);
            expect(retrieved).toEqual(created);
        });
        it('should throw error for non-existent class ID', async () => {
            await expect(service.getCustomClass('non-existent'))
                .rejects.toThrow('not found');
        });
        it('should throw validation error for empty class ID', async () => {
            await expect(service.getCustomClass(''))
                .rejects.toThrow('Custom class ID is required');
        });
    });
    describe('getAllCustomClasses', () => {
        it('should retrieve all custom classes sorted alphabetically', async () => {
            await service.createCustomClass({ name: 'Zebra Class' });
            await service.createCustomClass({ name: 'Alpha Class' });
            await service.createCustomClass({ name: 'Beta Class' });
            const classes = await service.getAllCustomClasses();
            expect(classes).toHaveLength(3);
            expect(classes[0].name).toBe('Alpha Class');
            expect(classes[1].name).toBe('Beta Class');
            expect(classes[2].name).toBe('Zebra Class');
        });
        it('should return empty array when no custom classes exist', async () => {
            const classes = await service.getAllCustomClasses();
            expect(classes).toHaveLength(0);
        });
    });
    describe('deleteCustomClass', () => {
        it('should delete existing custom class', async () => {
            const created = await service.createCustomClass(validClassData);
            await service.deleteCustomClass(created.id);
            await expect(service.getCustomClass(created.id))
                .rejects.toThrow('not found');
        });
        it('should throw error for non-existent class ID', async () => {
            await expect(service.deleteCustomClass('non-existent'))
                .rejects.toThrow('not found');
        });
        it('should throw validation error for empty class ID', async () => {
            await expect(service.deleteCustomClass(''))
                .rejects.toThrow('Custom class ID is required');
        });
    });
    describe('validateCustomClassData', () => {
        it('should pass validation for valid data', async () => {
            await expect(service.validateCustomClassData(validClassData))
                .resolves.not.toThrow();
        });
        it('should throw validation error for invalid data', async () => {
            const invalidData = { name: '' };
            await expect(service.validateCustomClassData(invalidData))
                .rejects.toThrow('Validation failed');
        });
    });
    describe('searchCustomClasses', () => {
        beforeEach(async () => {
            await service.createCustomClass({ name: 'Premium Class' });
            await service.createCustomClass({ name: 'Standard Class' });
            await service.createCustomClass({ name: 'Premium Plus' });
            await service.createCustomClass({ name: 'Basic Package' });
        });
        it('should search custom classes by partial name match', async () => {
            const results = await service.searchCustomClasses('Premium');
            expect(results).toHaveLength(2);
            expect(results.map(r => r.name)).toContain('Premium Class');
            expect(results.map(r => r.name)).toContain('Premium Plus');
        });
        it('should return all classes for empty search query', async () => {
            const results = await service.searchCustomClasses('');
            expect(results).toHaveLength(4);
        });
        it('should return empty array for no matches', async () => {
            const results = await service.searchCustomClasses('NonExistent');
            expect(results).toHaveLength(0);
        });
        it('should be case-insensitive', async () => {
            const results = await service.searchCustomClasses('PREMIUM');
            expect(results).toHaveLength(2);
        });
    });
    describe('getCustomClassByName', () => {
        it('should retrieve custom class by name (case-insensitive)', async () => {
            const created = await service.createCustomClass(validClassData);
            const retrieved = await service.getCustomClassByName('PREMIUM CLASS');
            expect(retrieved).toEqual(created);
        });
        it('should return null for non-existent name', async () => {
            const result = await service.getCustomClassByName('Non Existent');
            expect(result).toBeNull();
        });
        it('should throw validation error for empty name', async () => {
            await expect(service.getCustomClassByName(''))
                .rejects.toThrow('Custom class name is required');
        });
    });
    describe('isNameAvailable', () => {
        it('should return true for available name', async () => {
            const available = await service.isNameAvailable('Available Name');
            expect(available).toBe(true);
        });
        it('should return false for existing name', async () => {
            await service.createCustomClass(validClassData);
            const available = await service.isNameAvailable('Premium Class');
            expect(available).toBe(false);
        });
        it('should return true when excluding current ID', async () => {
            const created = await service.createCustomClass(validClassData);
            const available = await service.isNameAvailable('Premium Class', created.id);
            expect(available).toBe(true);
        });
        it('should return false for empty name', async () => {
            const available = await service.isNameAvailable('');
            expect(available).toBe(false);
        });
    });
    describe('error handling', () => {
        it('should handle repository errors gracefully', async () => {
            const errorRepository = {
                ...mockRepository,
                findByName: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            const errorService = new CustomUnitClassService_1.CustomUnitClassService(errorRepository);
            await expect(errorService.createCustomClass(validClassData))
                .rejects.toThrow('Failed to create custom unit class');
        });
        it('should preserve duplicate name errors from repository', async () => {
            const errorRepository = {
                ...mockRepository,
                findByName: jest.fn().mockResolvedValue({ id: 'existing', name: 'Premium Class', createdAt: new Date() })
            };
            const errorService = new CustomUnitClassService_1.CustomUnitClassService(errorRepository);
            await expect(errorService.createCustomClass(validClassData))
                .rejects.toThrow('already exists');
        });
    });
});
//# sourceMappingURL=CustomUnitClassService.test.js.map