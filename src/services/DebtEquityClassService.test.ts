import { DebtEquityClassService } from './DebtEquityClassService';
import { DebtEquityClass, DebtEquityClassFormData, IDebtEquityClassRepository } from '../types';

// Mock repository
class MockDebtEquityClassRepository implements IDebtEquityClassRepository {
  private classes: DebtEquityClass[] = [];
  private nextId = 1;

  async create(projectId: string, classData: Omit<DebtEquityClass, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>): Promise<DebtEquityClass> {
    const newClass: DebtEquityClass = {
      id: `class-${this.nextId++}`,
      projectId,
      ...classData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.classes.push(newClass);
    return newClass;
  }

  async findById(id: string): Promise<DebtEquityClass | null> {
    return this.classes.find(c => c.id === id) || null;
  }

  async findByProjectId(projectId: string): Promise<DebtEquityClass[]> {
    return this.classes.filter(c => c.projectId === projectId);
  }

  async update(id: string, updateData: Partial<Omit<DebtEquityClass, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>): Promise<DebtEquityClass | null> {
    const index = this.classes.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.classes[index] = {
      ...this.classes[index],
      ...updateData,
      updatedAt: new Date()
    };
    return this.classes[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.classes.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.classes.splice(index, 1);
    return true;
  }

  async deleteByProjectId(projectId: string): Promise<number> {
    const initialLength = this.classes.length;
    this.classes = this.classes.filter(c => c.projectId !== projectId);
    return initialLength - this.classes.length;
  }

  async countByProjectId(projectId: string): Promise<number> {
    return this.classes.filter(c => c.projectId === projectId).length;
  }

  async findByUnitClass(unitClass: string, projectId?: string): Promise<DebtEquityClass[]> {
    return this.classes.filter(c => 
      c.unitClass.toLowerCase() === unitClass.toLowerCase() &&
      (!projectId || c.projectId === projectId)
    );
  }

  // Helper methods for testing
  clear(): void {
    this.classes = [];
    this.nextId = 1;
  }

  getAll(): DebtEquityClass[] {
    return [...this.classes];
  }
}

describe('DebtEquityClassService', () => {
  let service: DebtEquityClassService;
  let mockRepository: MockDebtEquityClassRepository;

  const validClassData: DebtEquityClassFormData = {
    unitClass: 'Class A',
    unitPrice: 100,
    isOpenToInvestments: true,
    investmentIncrementAmount: 10,
    minInvestmentAmount: 100,
    maxInvestmentAmount: 1000
  };

  const projectId = 'project-123';

  beforeEach(() => {
    mockRepository = new MockDebtEquityClassRepository();
    service = new DebtEquityClassService(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  describe('createClass', () => {
    it('should create a new debt/equity class with valid data', async () => {
      const result = await service.createClass(projectId, validClassData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.projectId).toBe(projectId);
      expect(result.unitClass).toBe(validClassData.unitClass);
      expect(result.unitPrice).toBe(validClassData.unitPrice);
      expect(result.isOpenToInvestments).toBe(validClassData.isOpenToInvestments);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw validation error for missing project ID', async () => {
      await expect(service.createClass('', validClassData))
        .rejects.toThrow('Project ID is required');
    });

    it('should throw validation error for invalid unit price', async () => {
      const invalidData = { ...validClassData, unitPrice: -10 };
      
      await expect(service.createClass(projectId, invalidData))
        .rejects.toThrow('Validation failed');
    });

    it('should throw validation error for invalid investment amounts', async () => {
      const invalidData = { ...validClassData, minInvestmentAmount: 1000, maxInvestmentAmount: 100 };
      
      await expect(service.createClass(projectId, invalidData))
        .rejects.toThrow('Validation failed');
    });

    it('should throw validation error for increment greater than minimum', async () => {
      const invalidData = { ...validClassData, investmentIncrementAmount: 200, minInvestmentAmount: 100 };
      
      await expect(service.createClass(projectId, invalidData))
        .rejects.toThrow('Validation failed');
    });

    it('should throw error for duplicate unit class name in same project', async () => {
      await service.createClass(projectId, validClassData);
      
      await expect(service.createClass(projectId, validClassData))
        .rejects.toThrow('already exists for this project');
    });

    it('should allow same unit class name in different projects', async () => {
      await service.createClass(projectId, validClassData);
      
      const result = await service.createClass('project-456', validClassData);
      expect(result).toBeDefined();
      expect(result.projectId).toBe('project-456');
    });
  });

  describe('getClass', () => {
    it('should retrieve existing class by ID', async () => {
      const created = await service.createClass(projectId, validClassData);
      const retrieved = await service.getClass(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should throw error for non-existent class ID', async () => {
      await expect(service.getClass('non-existent'))
        .rejects.toThrow('not found');
    });

    it('should throw validation error for empty class ID', async () => {
      await expect(service.getClass(''))
        .rejects.toThrow('Class ID is required');
    });
  });

  describe('getClassesByProject', () => {
    it('should retrieve all classes for a project', async () => {
      const class1 = await service.createClass(projectId, validClassData);
      const class2Data = { ...validClassData, unitClass: 'Class B' };
      const class2 = await service.createClass(projectId, class2Data);

      const classes = await service.getClassesByProject(projectId);

      expect(classes).toHaveLength(2);
      expect(classes.map(c => c.id)).toContain(class1.id);
      expect(classes.map(c => c.id)).toContain(class2.id);
    });

    it('should return empty array for project with no classes', async () => {
      const classes = await service.getClassesByProject(projectId);
      expect(classes).toHaveLength(0);
    });

    it('should throw validation error for empty project ID', async () => {
      await expect(service.getClassesByProject(''))
        .rejects.toThrow('Project ID is required');
    });
  });

  describe('updateClass', () => {
    it('should update existing class with valid data', async () => {
      const created = await service.createClass(projectId, validClassData);
      
      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const updateData = { unitPrice: 150, isOpenToInvestments: false };
      const updated = await service.updateClass(created.id, updateData);

      expect(updated.unitPrice).toBe(150);
      expect(updated.isOpenToInvestments).toBe(false);
      expect(updated.unitClass).toBe(validClassData.unitClass); // Unchanged
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
    });

    it('should throw error for non-existent class ID', async () => {
      await expect(service.updateClass('non-existent', { unitPrice: 150 }))
        .rejects.toThrow('not found');
    });

    it('should throw validation error for invalid update data', async () => {
      const created = await service.createClass(projectId, validClassData);
      
      await expect(service.updateClass(created.id, { unitPrice: -10 }))
        .rejects.toThrow('Validation failed');
    });

    it('should throw error for duplicate unit class name update', async () => {
      const class1 = await service.createClass(projectId, validClassData);
      const class2Data = { ...validClassData, unitClass: 'Class B' };
      const class2 = await service.createClass(projectId, class2Data);

      await expect(service.updateClass(class2.id, { unitClass: 'Class A' }))
        .rejects.toThrow('already exists for this project');
    });
  });

  describe('deleteClass', () => {
    it('should delete existing class', async () => {
      const created = await service.createClass(projectId, validClassData);
      
      await service.deleteClass(created.id);
      
      await expect(service.getClass(created.id))
        .rejects.toThrow('not found');
    });

    it('should throw error for non-existent class ID', async () => {
      await expect(service.deleteClass('non-existent'))
        .rejects.toThrow('not found');
    });

    it('should throw validation error for empty class ID', async () => {
      await expect(service.deleteClass(''))
        .rejects.toThrow('Class ID is required');
    });
  });

  describe('validateClassData', () => {
    it('should pass validation for valid data', async () => {
      await expect(service.validateClassData(validClassData))
        .resolves.not.toThrow();
    });

    it('should throw validation error for missing unit class', async () => {
      const invalidData = { ...validClassData, unitClass: '' };
      
      await expect(service.validateClassData(invalidData))
        .rejects.toThrow('Validation failed');
    });

    it('should throw validation error for negative unit price', async () => {
      const invalidData = { ...validClassData, unitPrice: -10 };
      
      await expect(service.validateClassData(invalidData))
        .rejects.toThrow('Validation failed');
    });

    it('should throw validation error for zero investment amounts', async () => {
      const invalidData = { ...validClassData, minInvestmentAmount: 0 };
      
      await expect(service.validateClassData(invalidData))
        .rejects.toThrow('Validation failed');
    });

    it('should throw validation error for invalid investment amount relationships', async () => {
      const invalidData = { 
        ...validClassData, 
        minInvestmentAmount: 1000, 
        maxInvestmentAmount: 100 
      };
      
      await expect(service.validateClassData(invalidData))
        .rejects.toThrow('Validation failed');
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      const errorRepository = {
        ...mockRepository,
        findByUnitClass: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any;

      const errorService = new DebtEquityClassService(errorRepository);
      
      await expect(errorService.createClass(projectId, validClassData))
        .rejects.toThrow('Failed to create debt/equity class');
    });

    it('should preserve validation errors from repository', async () => {
      const errorRepository = {
        ...mockRepository,
        findByUnitClass: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockRejectedValue(new Error('A custom unit class with this name already exists'))
      } as any;

      const errorService = new DebtEquityClassService(errorRepository);
      
      await expect(errorService.createClass(projectId, validClassData))
        .rejects.toThrow('Failed to create debt/equity class');
    });
  });
});