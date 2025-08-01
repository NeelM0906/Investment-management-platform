import { DebtEquityClassModel } from '../models/DebtEquityClass';
import { DebtEquityClassFormData } from '../types';

describe('DebtEquityClassRepository Validation', () => {
  describe('Investment amount constraints validation', () => {
    it('should validate min <= max constraint', () => {
      const invalidData: DebtEquityClassFormData = {
        unitClass: 'Class A',
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 10,
        minInvestmentAmount: 1000, // min > max
        maxInvestmentAmount: 500
      };

      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Minimum investment amount cannot be greater than maximum investment amount');
    });

    it('should validate increment <= min constraint', () => {
      const invalidData: DebtEquityClassFormData = {
        unitClass: 'Class A',
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 200, // increment > min
        minInvestmentAmount: 100,
        maxInvestmentAmount: 1000
      };

      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Investment increment amount cannot be greater than minimum investment amount');
    });

    it('should validate increment divides evenly into range', () => {
      const invalidData: DebtEquityClassFormData = {
        unitClass: 'Class A',
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 30, // 100-500 = 400, 400 % 30 != 0
        minInvestmentAmount: 100,
        maxInvestmentAmount: 500
      };

      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Investment increment amount must divide evenly into the investment range');
    });

    it('should pass validation with correct constraints', () => {
      const validData: DebtEquityClassFormData = {
        unitClass: 'Class A',
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 50, // 100-500 = 400, 400 % 50 = 0
        minInvestmentAmount: 100,
        maxInvestmentAmount: 500
      };

      const errors = DebtEquityClassModel.validate(validData);
      expect(errors).toHaveLength(0);
    });

    it('should validate all positive number constraints', () => {
      const invalidData: DebtEquityClassFormData = {
        unitClass: 'Class A',
        unitPrice: -100, // negative
        isOpenToInvestments: true,
        investmentIncrementAmount: 0, // zero
        minInvestmentAmount: -50, // negative
        maxInvestmentAmount: 0 // zero
      };

      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Unit price must be greater than 0');
      expect(errors).toContain('Investment increment amount must be greater than 0');
      expect(errors).toContain('Minimum investment amount must be greater than 0');
      expect(errors).toContain('Maximum investment amount must be greater than 0');
    });

    it('should validate unit class requirements', () => {
      const invalidData: DebtEquityClassFormData = {
        unitClass: '', // empty
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 10,
        minInvestmentAmount: 100,
        maxInvestmentAmount: 1000
      };

      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Unit class is required');
    });

    it('should validate unit class length constraint', () => {
      const invalidData: DebtEquityClassFormData = {
        unitClass: 'A'.repeat(101), // too long
        unitPrice: 100,
        isOpenToInvestments: true,
        investmentIncrementAmount: 10,
        minInvestmentAmount: 100,
        maxInvestmentAmount: 1000
      };

      const errors = DebtEquityClassModel.validate(invalidData);
      expect(errors).toContain('Unit class must be less than 100 characters');
    });
  });
});