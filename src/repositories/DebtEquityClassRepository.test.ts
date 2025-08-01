import { DebtEquityClassRepository } from './DebtEquityClassRepository';
import { CustomUnitClassRepository } from './CustomUnitClassRepository';
import { DebtEquityClass, CustomUnitClass } from '../types';

describe('DebtEquityClassRepository Integration', () => {
  let repository: DebtEquityClassRepository;

  beforeEach(() => {
    repository = new DebtEquityClassRepository();
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

    // Retrieve by ID
    const retrievedClass = await repository.findById(createdClass.id);
    expect(retrievedClass).toEqual(createdClass);

    // Retrieve by project ID
    const projectClasses = await repository.findByProjectId(projectId);
    expect(projectClasses).toHaveLength(1);
    expect(projectClasses[0]).toEqual(createdClass);

    // Clean up
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
    expect(updatedClass!.unitPrice).toBe(250);
    expect(updatedClass!.isOpenToInvestments).toBe(false);
    expect(updatedClass!.updatedAt.getTime()).toBeGreaterThanOrEqual(createdClass.updatedAt.getTime());

    // Clean up
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
  let repository: CustomUnitClassRepository;

  beforeEach(() => {
    repository = new CustomUnitClassRepository();
  });

  it('should create and retrieve custom unit class', async () => {
    const classData = {
      name: 'Test Custom Class'
    };

    const createdClass = await repository.create(classData);

    expect(createdClass.id).toBeDefined();
    expect(createdClass.name).toBe('Test Custom Class');
    expect(createdClass.createdAt).toBeInstanceOf(Date);

    // Retrieve by ID
    const retrievedClass = await repository.findById(createdClass.id);
    expect(retrievedClass).toEqual(createdClass);

    // Retrieve by name
    const foundByName = await repository.findByName('Test Custom Class');
    expect(foundByName).toEqual(createdClass);

    // Clean up
    await repository.delete(createdClass.id);
  });

  it('should prevent duplicate names', async () => {
    const classData = {
      name: 'Duplicate Test Class'
    };

    const firstClass = await repository.create(classData);

    await expect(repository.create(classData))
      .rejects.toThrow('A custom unit class with this name already exists');

    // Clean up
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

    // Clean up
    for (const createdClass of createdClasses) {
      await repository.delete(createdClass.id);
    }
  });
});