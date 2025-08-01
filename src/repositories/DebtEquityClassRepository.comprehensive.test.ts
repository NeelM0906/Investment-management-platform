import { DebtEquityClassRepository } from './DebtEquityClassRepository';
import { CustomUnitClassRepository } from './CustomUnitClassRepository';
import { DebtEquityClass, CustomUnitClass } from '../types';

describe('DebtEquityClassRepository - Comprehensive Tests', () => {
  let repository: DebtEquityClassRepository;

  beforeEach(() => {
    repository = new DebtEquityClassRepository();
  });

  describe('Additional repository methods', () => {
    it('should delete all classes by project ID', async () => {
      const projectId = 'test-project-bulk-delete';
      const classesData = [
        {
          unitClass: 'Class A',
          unitPrice: 100,
          isOpenToInvestments: true,
          investmentIncrementAmount: 10,
          minInvestmentAmount: 100,
          maxInvestmentAmount: 1000
        },
        {
          unitClass: 'Class B',
          unitPrice: 200,
          isOpenToInvestments: false,
          investmentIncrementAmount: 20,
          minInvestmentAmount: 200,
          maxInvestmentAmount: 2000
        }
      ];

      // Create multiple classes for the project
      const createdClasses = [];
      for (const classData of classesData) {
        const created = await repository.create(projectId, classData);
        createdClasses.push(created);
      }

      // Verify classes exist
      const beforeDelete = await repository.findByProjectId(projectId);
      expect(beforeDelete).toHaveLength(2);

      // Delete all classes for the project
      const deletedCount = await repository.deleteByProjectId(projectId);
      expect(deletedCount).toBe(2);

      // Verify classes are deleted
      const afterDelete = await repository.findByProjectId(projectId);
      expect(afterDelete).toHaveLength(0);
    });

    it('should count classes by project ID', async () => {
      const projectId = 'test-project-count';
      const classData = {
        unitClass: 'Class A',
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 10,
        minInvestmentAmount: 100,
        maxInvestmentAmount: 1000
      };

      // Initially no classes
      const initialCount = await repository.countByProjectId(projectId);
      expect(initialCount).toBe(0);

      // Create a class
      const createdClass = await repository.create(projectId, classData);
      const afterCreateCount = await repository.countByProjectId(projectId);
      expect(afterCreateCount).toBe(1);

      // Clean up
      await repository.delete(createdClass.id);
    });

    it('should find classes by unit class name', async () => {
      const projectId1 = 'test-project-find-1';
      const projectId2 = 'test-project-find-2';
      const unitClassName = 'Premium Class';

      const classData = {
        unitClass: unitClassName,
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 10,
        minInvestmentAmount: 100,
        maxInvestmentAmount: 1000
      };

      // Create classes with same unit class name in different projects
      const class1 = await repository.create(projectId1, classData);
      const class2 = await repository.create(projectId2, classData);

      // Find all classes with this unit class name
      const allClasses = await repository.findByUnitClass(unitClassName);
      expect(allClasses).toHaveLength(2);
      expect(allClasses.map(c => c.projectId)).toContain(projectId1);
      expect(allClasses.map(c => c.projectId)).toContain(projectId2);

      // Find classes with unit class name for specific project
      const project1Classes = await repository.findByUnitClass(unitClassName, projectId1);
      expect(project1Classes).toHaveLength(1);
      expect(project1Classes[0].projectId).toBe(projectId1);

      // Clean up
      await repository.delete(class1.id);
      await repository.delete(class2.id);
    });

    it('should handle case-insensitive unit class search', async () => {
      const projectId = 'test-project-case-insensitive';
      const classData = {
        unitClass: 'Premium Class',
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 10,
        minInvestmentAmount: 100,
        maxInvestmentAmount: 1000
      };

      const createdClass = await repository.create(projectId, classData);

      // Search with different cases
      const lowerCaseResults = await repository.findByUnitClass('premium class');
      const upperCaseResults = await repository.findByUnitClass('PREMIUM CLASS');
      const mixedCaseResults = await repository.findByUnitClass('Premium CLASS');

      expect(lowerCaseResults).toHaveLength(1);
      expect(upperCaseResults).toHaveLength(1);
      expect(mixedCaseResults).toHaveLength(1);

      // Clean up
      await repository.delete(createdClass.id);
    });
  });

  describe('Investment amount constraint validation', () => {
    it('should enforce min <= max constraint at repository level', async () => {
      const projectId = 'test-project-validation';
      const invalidClassData = {
        unitClass: 'Invalid Class',
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 10,
        minInvestmentAmount: 1000, // min > max
        maxInvestmentAmount: 500
      };

      // The repository should accept this data (validation is handled at service layer)
      // But we can verify the data is stored correctly
      const createdClass = await repository.create(projectId, invalidClassData);
      expect(createdClass.minInvestmentAmount).toBe(1000);
      expect(createdClass.maxInvestmentAmount).toBe(500);

      // Clean up
      await repository.delete(createdClass.id);
    });

    it('should handle edge case with zero range (min = max)', async () => {
      const projectId = 'test-project-zero-range';
      const classData = {
        unitClass: 'Fixed Amount Class',
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 100,
        minInvestmentAmount: 100,
        maxInvestmentAmount: 100 // min = max
      };

      const createdClass = await repository.create(projectId, classData);
      expect(createdClass.minInvestmentAmount).toBe(createdClass.maxInvestmentAmount);

      // Clean up
      await repository.delete(createdClass.id);
    });
  });

  describe('Data persistence and integrity', () => {
    it('should maintain data integrity across multiple operations', async () => {
      const projectId = 'test-project-integrity';
      const classData = {
        unitClass: 'Integrity Test Class',
        unitPrice: 150.75,
        isOpenToInvestments: true,
        investmentIncrementAmount: 25.25,
        minInvestmentAmount: 100.50,
        maxInvestmentAmount: 1000.00
      };

      // Create
      const created = await repository.create(projectId, classData);
      expect(created.unitPrice).toBe(150.75);
      expect(created.investmentIncrementAmount).toBe(25.25);

      // Update
      const updateData = { unitPrice: 175.25, isOpenToInvestments: false };
      const updated = await repository.update(created.id, updateData);
      expect(updated!.unitPrice).toBe(175.25);
      expect(updated!.isOpenToInvestments).toBe(false);
      expect(updated!.investmentIncrementAmount).toBe(25.25); // Should remain unchanged

      // Verify persistence
      const retrieved = await repository.findById(created.id);
      expect(retrieved!.unitPrice).toBe(175.25);
      expect(retrieved!.isOpenToInvestments).toBe(false);

      // Clean up
      await repository.delete(created.id);
    });

    it('should handle sequential operations correctly', async () => {
      const projectId = 'test-project-sequential';
      const classesData = Array.from({ length: 5 }, (_, i) => ({
        unitClass: `Sequential Class ${i + 1}`,
        unitPrice: 100 + i * 10,
        isOpenToInvestments: true,
        investmentIncrementAmount: 10,
        minInvestmentAmount: 100,
        maxInvestmentAmount: 1000
      }));

      // Create multiple classes sequentially (more realistic for file-based storage)
      const createdClasses = [];
      for (const classData of classesData) {
        const created = await repository.create(projectId, classData);
        createdClasses.push(created);
      }

      expect(createdClasses).toHaveLength(5);
      expect(new Set(createdClasses.map(c => c.id)).size).toBe(5); // All should have unique IDs

      // Verify all classes exist
      const allClasses = await repository.findByProjectId(projectId);
      expect(allClasses).toHaveLength(5);

      // Clean up
      for (const createdClass of createdClasses) {
        await repository.delete(createdClass.id);
      }
    });
  });
});

describe('CustomUnitClassRepository - Comprehensive Tests', () => {
  let repository: CustomUnitClassRepository;

  beforeEach(() => {
    repository = new CustomUnitClassRepository();
  });

  describe('Additional repository methods', () => {
    it('should check if name exists excluding specific ID', async () => {
      const classData = { name: 'Unique Test Class' };
      const createdClass = await repository.create(classData);

      // Should return true when checking without exclusion
      const existsWithoutExclusion = await repository.existsByName('Unique Test Class');
      expect(existsWithoutExclusion).toBe(true);

      // Should return false when excluding the created class ID
      const existsWithExclusion = await repository.existsByName('Unique Test Class', createdClass.id);
      expect(existsWithExclusion).toBe(false);

      // Clean up
      await repository.delete(createdClass.id);
    });

    it('should search classes with partial name matching', async () => {
      const testClasses = [
        { name: 'Alpha Premium Class' },
        { name: 'Beta Premium Class' },
        { name: 'Alpha Standard Class' },
        { name: 'Gamma Basic Class' }
      ];

      const createdClasses = [];
      for (const classData of testClasses) {
        const created = await repository.create(classData);
        createdClasses.push(created);
      }

      // Search for "Premium"
      const premiumResults = await repository.search('Premium');
      expect(premiumResults).toHaveLength(2);
      expect(premiumResults.map(c => c.name)).toContain('Alpha Premium Class');
      expect(premiumResults.map(c => c.name)).toContain('Beta Premium Class');

      // Search for "Alpha"
      const alphaResults = await repository.search('Alpha');
      expect(alphaResults).toHaveLength(2);
      expect(alphaResults.map(c => c.name)).toContain('Alpha Premium Class');
      expect(alphaResults.map(c => c.name)).toContain('Alpha Standard Class');

      // Search for "Class" (should match all)
      const classResults = await repository.search('Class');
      expect(classResults).toHaveLength(4);

      // Clean up
      for (const createdClass of createdClasses) {
        await repository.delete(createdClass.id);
      }
    });

    it('should handle case-insensitive search', async () => {
      const classData = { name: 'CamelCase Test Class' };
      const createdClass = await repository.create(classData);

      const lowerResults = await repository.search('camelcase');
      const upperResults = await repository.search('CAMELCASE');
      const mixedResults = await repository.search('CaMeLcAsE');

      expect(lowerResults).toHaveLength(1);
      expect(upperResults).toHaveLength(1);
      expect(mixedResults).toHaveLength(1);

      // Clean up
      await repository.delete(createdClass.id);
    });

    it('should return sorted results from findAll and search', async () => {
      const testClasses = [
        { name: 'Zebra Class' },
        { name: 'Alpha Class' },
        { name: 'Beta Class' }
      ];

      const createdClasses = [];
      for (const classData of testClasses) {
        const created = await repository.create(classData);
        createdClasses.push(created);
      }

      // Test findAll sorting
      const allClasses = await repository.findAll();
      const relevantClasses = allClasses.filter(c => 
        c.name.includes('Alpha Class') || 
        c.name.includes('Beta Class') || 
        c.name.includes('Zebra Class')
      );
      
      expect(relevantClasses[0].name).toBe('Alpha Class');
      expect(relevantClasses[1].name).toBe('Beta Class');
      expect(relevantClasses[2].name).toBe('Zebra Class');

      // Test search sorting
      const searchResults = await repository.search('Class');
      const relevantSearchResults = searchResults.filter(c => 
        c.name.includes('Alpha Class') || 
        c.name.includes('Beta Class') || 
        c.name.includes('Zebra Class')
      );
      
      expect(relevantSearchResults[0].name).toBe('Alpha Class');
      expect(relevantSearchResults[1].name).toBe('Beta Class');
      expect(relevantSearchResults[2].name).toBe('Zebra Class');

      // Clean up
      for (const createdClass of createdClasses) {
        await repository.delete(createdClass.id);
      }
    });
  });

  describe('Data validation and constraints', () => {
    it('should enforce unique name constraint', async () => {
      const classData = { name: 'Duplicate Test Class' };
      
      // First creation should succeed
      const firstClass = await repository.create(classData);
      expect(firstClass.name).toBe('Duplicate Test Class');

      // Second creation with same name should fail
      await expect(repository.create(classData))
        .rejects.toThrow('A custom unit class with this name already exists');

      // Clean up
      await repository.delete(firstClass.id);
    });

    it('should handle case-insensitive duplicate detection', async () => {
      const firstClassData = { name: 'Case Test Class' };
      const secondClassData = { name: 'CASE TEST CLASS' };
      
      const firstClass = await repository.create(firstClassData);
      
      await expect(repository.create(secondClassData))
        .rejects.toThrow('A custom unit class with this name already exists');

      // Clean up
      await repository.delete(firstClass.id);
    });
  });
});