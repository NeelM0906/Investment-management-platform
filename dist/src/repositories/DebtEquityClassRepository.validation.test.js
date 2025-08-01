"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DebtEquityClass_1 = require("../models/DebtEquityClass");
describe('DebtEquityClassRepository Validation', () => {
    describe('Investment amount constraints validation', () => {
        it('should validate min <= max constraint', () => {
            const invalidData = {
                unitClass: 'Class A',
                unitPrice: 100,
                isOpenToInvestments: true,
                investmentIncrementAmount: 10,
                minInvestmentAmount: 1000,
                maxInvestmentAmount: 500
            };
            const errors = DebtEquityClass_1.DebtEquityClassModel.validate(invalidData);
            expect(errors).toContain('Minimum investment amount cannot be greater than maximum investment amount');
        });
        it('should validate increment <= min constraint', () => {
            const invalidData = {
                unitClass: 'Class A',
                unitPrice: 100,
                isOpenToInvestments: true,
                investmentIncrementAmount: 200,
                minInvestmentAmount: 100,
                maxInvestmentAmount: 1000
            };
            const errors = DebtEquityClass_1.DebtEquityClassModel.validate(invalidData);
            expect(errors).toContain('Investment increment amount cannot be greater than minimum investment amount');
        });
        it('should validate increment divides evenly into range', () => {
            const invalidData = {
                unitClass: 'Class A',
                unitPrice: 100,
                isOpenToInvestments: true,
                investmentIncrementAmount: 30,
                minInvestmentAmount: 100,
                maxInvestmentAmount: 500
            };
            const errors = DebtEquityClass_1.DebtEquityClassModel.validate(invalidData);
            expect(errors).toContain('Investment increment amount must divide evenly into the investment range');
        });
        it('should pass validation with correct constraints', () => {
            const validData = {
                unitClass: 'Class A',
                unitPrice: 100,
                isOpenToInvestments: true,
                investmentIncrementAmount: 50,
                minInvestmentAmount: 100,
                maxInvestmentAmount: 500
            };
            const errors = DebtEquityClass_1.DebtEquityClassModel.validate(validData);
            expect(errors).toHaveLength(0);
        });
        it('should validate all positive number constraints', () => {
            const invalidData = {
                unitClass: 'Class A',
                unitPrice: -100,
                isOpenToInvestments: true,
                investmentIncrementAmount: 0,
                minInvestmentAmount: -50,
                maxInvestmentAmount: 0
            };
            const errors = DebtEquityClass_1.DebtEquityClassModel.validate(invalidData);
            expect(errors).toContain('Unit price must be greater than 0');
            expect(errors).toContain('Investment increment amount must be greater than 0');
            expect(errors).toContain('Minimum investment amount must be greater than 0');
            expect(errors).toContain('Maximum investment amount must be greater than 0');
        });
        it('should validate unit class requirements', () => {
            const invalidData = {
                unitClass: '',
                unitPrice: 100,
                isOpenToInvestments: true,
                investmentIncrementAmount: 10,
                minInvestmentAmount: 100,
                maxInvestmentAmount: 1000
            };
            const errors = DebtEquityClass_1.DebtEquityClassModel.validate(invalidData);
            expect(errors).toContain('Unit class is required');
        });
        it('should validate unit class length constraint', () => {
            const invalidData = {
                unitClass: 'A'.repeat(101),
                unitPrice: 100,
                isOpenToInvestments: true,
                investmentIncrementAmount: 10,
                minInvestmentAmount: 100,
                maxInvestmentAmount: 1000
            };
            const errors = DebtEquityClass_1.DebtEquityClassModel.validate(invalidData);
            expect(errors).toContain('Unit class must be less than 100 characters');
        });
    });
});
//# sourceMappingURL=DebtEquityClassRepository.validation.test.js.map