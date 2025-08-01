import { DebtEquityClassModel, CustomUnitClassModel } from './DebtEquityClass';
import { DebtEquityClassFormData, CustomUnitClassFormData } from '../types';

describe('DebtEquityClassModel', () => {
  describe('validate', () => {
    const validClassData: DebtEquityClassFormData = {
      unitClass: 'Class A',
      unitPrice: 100,
      isOpenToInvestments: true,
      investmentIncrementAmount: 10,
      minInvestmentAmount: 100,
      maxInvestmentAmount: 1000
    };

    it('should return no errors for valid data', () => {
      const errors = DebtEquityClassModel.validate(validClassData);
      expect(errors).toEqual([]);
    });

    it('should require unit class', () => {
      const invalidData = { ...validClassData, unitClass: '' };
      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Unit class is required');
    });

    it('should validate unit class length', () => {
      const invalidData = { ...validClassData, unitClass: 'a'.repeat(101) };
      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Unit class must be less than 100 characters');
    });

    it('should require positive unit price', () => {
      const invalidData = { ...validClassData, unitPrice: 0 };
      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Unit price must be greater than 0');
    });

    it('should require positive investment increment amount', () => {
      const invalidData = { ...validClassData, investmentIncrementAmount: 0 };
      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Investment increment amount must be greater than 0');
    });

    it('should require positive minimum investment amount', () => {
      const invalidData = { ...validClassData, minInvestmentAmount: 0 };
      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Minimum investment amount must be greater than 0');
    });

    it('should require positive maximum investment amount', () => {
      const invalidData = { ...validClassData, maxInvestmentAmount: 0 };
      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Maximum investment amount must be greater than 0');
    });

    it('should validate min <= max investment amounts', () => {
      const invalidData = { ...validClassData, minInvestmentAmount: 1000, maxInvestmentAmount: 100 };
      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Minimum investment amount cannot be greater than maximum investment amount');
    });

    it('should validate increment <= min investment amounts', () => {
      const invalidData = { ...validClassData, investmentIncrementAmount: 200, minInvestmentAmount: 100 };
      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Investment increment amount cannot be greater than minimum investment amount');
    });

    it('should validate increment divides evenly into range', () => {
      const invalidData = { 
        ...validClassData, 
        investmentIncrementAmount: 30, 
        minInvestmentAmount: 100, 
        maxInvestmentAmount: 950 
      };
      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Investment increment amount must divide evenly into the investment range');
    });

    it('should allow increment that divides evenly into range', () => {
      const validData = { 
        ...validClassData, 
        investmentIncrementAmount: 25, 
        minInvestmentAmount: 100, 
        maxInvestmentAmount: 1000 
      };
      const errors = DebtEquityClassModel.validate(validData);
      expect(errors).toEqual([]);
    });
  });

  describe('fromFormData', () => {
    it('should transform form data correctly', () => {
      const formData: DebtEquityClassFormData = {
        unitClass: '  Class A  ',
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 10,
        minInvestmentAmount: 100,
        maxInvestmentAmount: 1000
      };

      const result = DebtEquityClassModel.fromFormData('project-123', formData);

      expect(result).toEqual({
        projectId: 'project-123',
        unitClass: 'Class A',
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 10,
        minInvestmentAmount: 100,
        maxInvestmentAmount: 1000
      });
    });
  });

  describe('create', () => {
    it('should create a debt equity class with id and timestamps', () => {
      const classData = {
        projectId: 'project-123',
        unitClass: 'Class A',
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 10,
        minInvestmentAmount: 100,
        maxInvestmentAmount: 1000
      };

      const result = DebtEquityClassModel.create('project-123', classData);

      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.projectId).toBe('project-123');
      expect(result.unitClass).toBe('Class A');
    });
  });

  describe('update', () => {
    it('should update debt equity class with new timestamp', () => {
      const existingClass = {
        id: 'class-123',
        projectId: 'project-123',
        unitClass: 'Class A',
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 10,
        minInvestmentAmount: 100,
        maxInvestmentAmount: 1000,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      const updateData = { unitPrice: 150 };
      const result = DebtEquityClassModel.update(existingClass, updateData);

      expect(result.unitPrice).toBe(150);
      expect(result.updatedAt.getTime()).toBeGreaterThan(existingClass.updatedAt.getTime());
      expect(result.createdAt).toBe(existingClass.createdAt);
    });
  });
});

describe('CustomUnitClassModel', () => {
  describe('validate', () => {
    const validClassData: CustomUnitClassFormData = {
      name: 'Custom Class 1'
    };

    it('should return no errors for valid data', () => {
      const errors = CustomUnitClassModel.validate(validClassData);
      expect(errors).toEqual([]);
    });

    it('should require name', () => {
      const invalidData = { name: '' };
      const errors = CustomUnitClassModel.validate(invalidData);
      expect(errors).toContain('Custom class name is required');
    });

    it('should validate name length', () => {
      const invalidData = { name: 'a'.repeat(101) };
      const errors = CustomUnitClassModel.validate(invalidData);
      expect(errors).toContain('Custom class name must be less than 100 characters');
    });

    it('should require minimum name length', () => {
      const invalidData = { name: 'a' };
      const errors = CustomUnitClassModel.validate(invalidData);
      expect(errors).toContain('Custom class name must be at least 2 characters long');
    });

    it('should reject reserved names', () => {
      const reservedNames = ['class a', 'Class A', 'DEBT', 'equity'];
      
      reservedNames.forEach(name => {
        const invalidData = { name };
        const errors = CustomUnitClassModel.validate(invalidData);
        expect(errors).toContain('This class name is reserved and cannot be used');
      });
    });

    it('should validate name pattern', () => {
      const invalidNames = ['Class@1', 'Class#1', 'Class$1', 'Class%1'];
      
      invalidNames.forEach(name => {
        const invalidData = { name };
        const errors = CustomUnitClassModel.validate(invalidData);
        expect(errors).toContain('Custom class name can only contain letters, numbers, spaces, hyphens, and underscores');
      });
    });

    it('should allow valid name patterns', () => {
      const validNames = ['Class 1', 'Class-A', 'Class_B', 'Custom123', 'My-Custom_Class 1'];
      
      validNames.forEach(name => {
        const validData = { name };
        const errors = CustomUnitClassModel.validate(validData);
        expect(errors).toEqual([]);
      });
    });
  });

  describe('fromFormData', () => {
    it('should transform form data correctly', () => {
      const formData: CustomUnitClassFormData = {
        name: '  Custom Class 1  '
      };

      const result = CustomUnitClassModel.fromFormData(formData);

      expect(result).toEqual({
        name: 'Custom Class 1'
      });
    });
  });

  describe('create', () => {
    it('should create a custom unit class with id and timestamp', () => {
      const classData = {
        name: 'Custom Class 1'
      };

      const result = CustomUnitClassModel.create(classData);

      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.name).toBe('Custom Class 1');
    });
  });
});