"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('Project Types', () => {
    test('Project interface should have all required fields', () => {
        const mockProject = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            projectName: 'Test Project',
            legalProjectName: 'Test Project LLC',
            unitCalculationPrecision: 2,
            targetAmount: 1000000,
            currency: 'USD',
            timeframe: {
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31')
            },
            commitments: {
                totalAmount: 250000,
                investorCount: 5
            },
            reservations: {
                totalAmount: 100000,
                investorCount: 3
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        expect(mockProject.id).toBeDefined();
        expect(mockProject.projectName).toBeDefined();
        expect(mockProject.legalProjectName).toBeDefined();
        expect(typeof mockProject.unitCalculationPrecision).toBe('number');
        expect(typeof mockProject.targetAmount).toBe('number');
        expect(mockProject.currency).toBeDefined();
        expect(mockProject.timeframe.startDate).toBeInstanceOf(Date);
        expect(mockProject.timeframe.endDate).toBeInstanceOf(Date);
    });
    test('ProjectFormData interface should have all required fields', () => {
        const mockFormData = {
            projectName: 'Test Project',
            legalProjectName: 'Test Project LLC',
            unitCalculationPrecision: 2,
            targetAmount: 1000000,
            currency: 'USD',
            startDate: '2024-01-01',
            endDate: '2024-12-31'
        };
        expect(mockFormData.projectName).toBeDefined();
        expect(mockFormData.legalProjectName).toBeDefined();
        expect(typeof mockFormData.unitCalculationPrecision).toBe('number');
        expect(typeof mockFormData.targetAmount).toBe('number');
        expect(mockFormData.currency).toBeDefined();
        expect(typeof mockFormData.startDate).toBe('string');
        expect(typeof mockFormData.endDate).toBe('string');
    });
    test('ProjectFilters interface should work with optional fields', () => {
        const basicFilter = {
            searchTerm: 'test'
        };
        const advancedFilter = {
            searchTerm: 'test',
            dateRange: {
                start: new Date('2024-01-01'),
                end: new Date('2024-12-31')
            }
        };
        expect(basicFilter.searchTerm).toBe('test');
        expect(basicFilter.dateRange).toBeUndefined();
        expect(advancedFilter.dateRange).toBeDefined();
    });
});
//# sourceMappingURL=index.test.js.map