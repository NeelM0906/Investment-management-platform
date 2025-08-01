import fs from 'fs/promises';
import path from 'path';
import { FileStorage } from './fileStorage';
import { DebtEquityClass, CustomUnitClass } from '../types';

describe('FileStorage - Debt & Equity Classes', () => {
  let fileStorage: FileStorage;
  const testDataDir = path.join(process.cwd(), 'test-data');
  
  beforeEach(async () => {
    fileStorage = new FileStorage();
    // Override data directory for testing
    (fileStorage as any).dataDir = testDataDir;
    (fileStorage as any).debtEquityClassesFile = path.join(testDataDir, 'debt-equity-classes.json');
    (fileStorage as any).customUnitClassesFile = path.join(testDataDir, 'custom-unit-classes.json');
    
    // Clean up test directory
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist, ignore error
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist, ignore error
    }
  });

  describe('Debt & Equity Classes', () => {
    it('should create and read debt equity classes file', async () => {
      const testClasses: DebtEquityClass[] = [
        {
          id: 'class-1',
          projectId: 'project-1',
          unitClass: 'Class A',
          unitPrice: 100,
          isOpenToInvestments: true,
          investmentIncrementAmount: 10,
          minInvestmentAmount: 100,
          maxInvestmentAmount: 1000,
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
          updatedAt: new Date('2023-01-01T00:00:00.000Z')
        }
      ];

      await fileStorage.writeDebtEquityClasses(testClasses);
      const readClasses = await fileStorage.readDebtEquityClasses();

      expect(readClasses).toHaveLength(1);
      expect(readClasses[0].id).toBe('class-1');
      expect(readClasses[0].unitClass).toBe('Class A');
      expect(readClasses[0].createdAt).toBeInstanceOf(Date);
      expect(readClasses[0].updatedAt).toBeInstanceOf(Date);
    });

    it('should handle empty debt equity classes file', async () => {
      const classes = await fileStorage.readDebtEquityClasses();
      expect(classes).toEqual([]);
    });

    it('should create backup of debt equity classes', async () => {
      const testClasses: DebtEquityClass[] = [
        {
          id: 'class-1',
          projectId: 'project-1',
          unitClass: 'Class A',
          unitPrice: 100,
          isOpenToInvestments: true,
          investmentIncrementAmount: 10,
          minInvestmentAmount: 100,
          maxInvestmentAmount: 1000,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await fileStorage.writeDebtEquityClasses(testClasses);
      await fileStorage.backupDebtEquityClasses();

      // Check that backup file was created
      const files = await fs.readdir(testDataDir);
      const backupFiles = files.filter(file => file.startsWith('debt-equity-classes-backup-'));
      expect(backupFiles.length).toBeGreaterThan(0);
    });
  });

  describe('Custom Unit Classes', () => {
    it('should create and read custom unit classes file', async () => {
      const testClasses: CustomUnitClass[] = [
        {
          id: 'custom-1',
          name: 'Custom Class 1',
          createdAt: new Date('2023-01-01T00:00:00.000Z')
        }
      ];

      await fileStorage.writeCustomUnitClasses(testClasses);
      const readClasses = await fileStorage.readCustomUnitClasses();

      expect(readClasses).toHaveLength(1);
      expect(readClasses[0].id).toBe('custom-1');
      expect(readClasses[0].name).toBe('Custom Class 1');
      expect(readClasses[0].createdAt).toBeInstanceOf(Date);
    });

    it('should handle empty custom unit classes file', async () => {
      const classes = await fileStorage.readCustomUnitClasses();
      expect(classes).toEqual([]);
    });

    it('should create backup of custom unit classes', async () => {
      const testClasses: CustomUnitClass[] = [
        {
          id: 'custom-1',
          name: 'Custom Class 1',
          createdAt: new Date()
        }
      ];

      await fileStorage.writeCustomUnitClasses(testClasses);
      await fileStorage.backupCustomUnitClasses();

      // Check that backup file was created
      const files = await fs.readdir(testDataDir);
      const backupFiles = files.filter(file => file.startsWith('custom-unit-classes-backup-'));
      expect(backupFiles.length).toBeGreaterThan(0);
    });
  });
});