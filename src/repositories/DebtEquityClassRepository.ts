import { FileStorage } from '../utils/fileStorage';
import { DebtEquityClass, IDebtEquityClassRepository } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class DebtEquityClassRepository implements IDebtEquityClassRepository {
  private fileStorage: FileStorage;

  constructor() {
    this.fileStorage = new FileStorage();
  }

  async create(projectId: string, classData: Omit<DebtEquityClass, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>): Promise<DebtEquityClass> {
    const classes = await this.fileStorage.readDebtEquityClasses();
    
    const newClass: DebtEquityClass = {
      id: uuidv4(),
      projectId,
      ...classData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    classes.push(newClass);
    await this.fileStorage.writeDebtEquityClasses(classes);
    
    return newClass;
  }

  async findById(id: string): Promise<DebtEquityClass | null> {
    const classes = await this.fileStorage.readDebtEquityClasses();
    return classes.find(debtEquityClass => debtEquityClass.id === id) || null;
  }

  async findByProjectId(projectId: string): Promise<DebtEquityClass[]> {
    const classes = await this.fileStorage.readDebtEquityClasses();
    return classes.filter(debtEquityClass => debtEquityClass.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by creation date (newest first)
  }

  async update(id: string, updateData: Partial<Omit<DebtEquityClass, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>): Promise<DebtEquityClass | null> {
    const classes = await this.fileStorage.readDebtEquityClasses();
    const classIndex = classes.findIndex(debtEquityClass => debtEquityClass.id === id);
    
    if (classIndex === -1) {
      return null;
    }

    const updatedClass: DebtEquityClass = {
      ...classes[classIndex],
      ...updateData,
      updatedAt: new Date()
    };

    classes[classIndex] = updatedClass;
    await this.fileStorage.writeDebtEquityClasses(classes);
    
    return updatedClass;
  }

  async delete(id: string): Promise<boolean> {
    const classes = await this.fileStorage.readDebtEquityClasses();
    const classIndex = classes.findIndex(debtEquityClass => debtEquityClass.id === id);
    
    if (classIndex === -1) {
      return false;
    }

    // Create backup before deletion
    await this.fileStorage.backupDebtEquityClasses();
    
    classes.splice(classIndex, 1);
    await this.fileStorage.writeDebtEquityClasses(classes);
    
    return true;
  }

  async deleteByProjectId(projectId: string): Promise<number> {
    const classes = await this.fileStorage.readDebtEquityClasses();
    const initialCount = classes.length;
    
    const filteredClasses = classes.filter(debtEquityClass => debtEquityClass.projectId !== projectId);
    
    if (filteredClasses.length !== initialCount) {
      // Create backup before deletion
      await this.fileStorage.backupDebtEquityClasses();
      await this.fileStorage.writeDebtEquityClasses(filteredClasses);
    }
    
    return initialCount - filteredClasses.length;
  }

  async countByProjectId(projectId: string): Promise<number> {
    const classes = await this.fileStorage.readDebtEquityClasses();
    return classes.filter(debtEquityClass => debtEquityClass.projectId === projectId).length;
  }

  async findByUnitClass(unitClass: string, projectId?: string): Promise<DebtEquityClass[]> {
    const classes = await this.fileStorage.readDebtEquityClasses();
    return classes.filter(debtEquityClass => 
      debtEquityClass.unitClass.toLowerCase() === unitClass.toLowerCase() &&
      (!projectId || debtEquityClass.projectId === projectId)
    );
  }
}