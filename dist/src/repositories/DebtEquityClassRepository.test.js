"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DebtEquityClassRepository_1 = require("./DebtEquityClassRepository");
const CustomUnitClassRepository_1 = require("./CustomUnitClassRepository");
describe('DebtEquityClassRepository Integration', () => {
    let repository;
    beforeEach(() => {
        repository = new DebtEquityClassRepository_1.DebtEquityClassRepository();
    });
    it('should create and retrieve debt equity class', async () => {
        const projectId = 'test-project-123';
        const classData = {
            unitClass: 'Class A',
            unitPrice: 100,
            isOpenToInvestments: true,
            investmentIncrementAmount: 10,
            minInvestmentAmount: 100,
            maxInvestmentAmount: 1000
        };
        const createdClass = await repository.create(projectId, classData);
        expect(createdClass.id).toBeDefined();
        expect(createdClass.projectId).toBe(projectId);
        expect(createdClass.unitClass).toBe('Class A');
        expect(createdClass.createdAt).toBeInstanceOf(Date);
        expect(createdClass.updatedAt).toBeInstanceOf(Date);
        const retrievedClass = await repository.findById(createdClass.id);
        expect(retrievedClass).toEqual(createdClass);
        const projectClasses = await repository.findByProjectId(projectId);
        expect(projectClasses).toHaveLength(1);
        expect(projectClasses[0]).toEqual(createdClass);
        await repository.delete(createdClass.id);
    });
    it('should update debt equity class', async () => {
        const projectId = 'test-project-456';
        const classData = {
            unitClass: 'Class B',
            unitPrice: 200,
            isOpenToInvestments: true,
            investmentIncrementAmount: 20,
            minInvestmentAmount: 200,
            maxInvestmentAmount: 2000
        };
        const createdClass = await repository.create(projectId, classData);
        const updateData = { unitPrice: 250, isOpenToInvestments: false };
        const updatedClass = await repository.update(createdClass.id, updateData);
        expect(updatedClass).not.toBeNull();
        expect(updatedClass.unitPrice).toBe(250);
        expect(updatedClass.isOpenToInvestments).toBe(false);
        expect(updatedClass.updatedAt.getTime()).toBeGreaterThanOrEqual(createdClass.updatedAt.getTime());
        await repository.delete(createdClass.id);
    });
    it('should delete debt equity class', async () => {
        const projectId = 'test-project-789';
        const classData = {
            unitClass: 'Class C',
            unitPrice: 300,
            isOpenToInvestments: true,
            investmentIncrementAmount: 30,
            minInvestmentAmount: 300,
            maxInvestmentAmount: 3000
        };
        const createdClass = await repository.create(projectId, classData);
        const deleted = await repository.delete(createdClass.id);
        expect(deleted).toBe(true);
        const retrievedClass = await repository.findById(createdClass.id);
        expect(retrievedClass).toBeNull();
    });
});
describe('CustomUnitClassRepository Integration', () => {
    let repository;
    beforeEach(() => {
        repository = new CustomUnitClassRepository_1.CustomUnitClassRepository();
    });
    it('should create and retrieve custom unit class', async () => {
        const classData = {
            name: 'Test Custom Class'
        };
        const createdClass = await repository.create(classData);
        expect(createdClass.id).toBeDefined();
        expect(createdClass.name).toBe('Test Custom Class');
        expect(createdClass.createdAt).toBeInstanceOf(Date);
        const retrievedClass = await repository.findById(createdClass.id);
        expect(retrievedClass).toEqual(createdClass);
        const foundByName = await repository.findByName('Test Custom Class');
        expect(foundByName).toEqual(createdClass);
        await repository.delete(createdClass.id);
    });
    it('should prevent duplicate names', async () => {
        const classData = {
            name: 'Duplicate Test Class'
        };
        const firstClass = await repository.create(classData);
        await expect(repository.create(classData))
            .rejects.toThrow('A custom unit class with this name already exists');
        await repository.delete(firstClass.id);
    });
    it('should search custom unit classes', async () => {
        const testClasses = [
            { name: 'Alpha Class' },
            { name: 'Beta Class' },
            { name: 'Alpha Beta Class' }
        ];
        const createdClasses = [];
        for (const classData of testClasses) {
            const created = await repository.create(classData);
            createdClasses.push(created);
        }
        const searchResults = await repository.search('Alpha');
        expect(searchResults).toHaveLength(2);
        expect(searchResults.map(c => c.name)).toContain('Alpha Class');
        expect(searchResults.map(c => c.name)).toContain('Alpha Beta Class');
        for (const createdClass of createdClasses) {
            await repository.delete(createdClass.id);
        }
    });
});
//# sourceMappingURL=DebtEquityClassRepository.test.js.map