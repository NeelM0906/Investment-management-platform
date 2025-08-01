import { FileStorage } from '../utils/fileStorage';
import { CustomUnitClass, ICustomUnitClassRepository } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class CustomUnitClassRepository implements ICustomUnitClassRepository {
  private fileStorage: FileStorage;

  constructor() {
    this.fileStorage = new FileStorage();
  }

  async create(classData: Omit<CustomUnitClass, 'id' | 'createdAt'>): Promise<CustomUnitClass> {
    const classes = await this.fileStorage.readCustomUnitClasses();
    
    // Check for duplicate names (case-insensitive)
    const existingClass = classes.find(c => 
      c.name.toLowerCase() === classData.name.toLowerCase()
    );
    
    if (existingClass) {
      throw new Error('A custom unit class with this name already exists');
    }

    const newClass: CustomUnitClass = {
      id: uuidv4(),
      ...classData,
      createdAt: new Date()
    };

    classes.push(newClass);
    await this.fileStorage.writeCustomUnitClasses(classes);
    
    return newClass;
  }

  async findById(id: string): Promise<CustomUnitClass | null> {
    const classes = await this.fileStorage.readCustomUnitClasses();
    return classes.find(customClass => customClass.id === id) || null;
  }

  async findAll(): Promise<CustomUnitClass[]> {
    const classes = await this.fileStorage.readCustomUnitClasses();
    return classes.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
  }

  async findByName(name: string): Promise<CustomUnitClass | null> {
    const classes = await this.fileStorage.readCustomUnitClasses();
    return classes.find(customClass => 
      customClass.name.toLowerCase() === name.toLowerCase()
    ) || null;
  }

  async delete(id: string): Promise<boolean> {
    const classes = await this.fileStorage.readCustomUnitClasses();
    const classIndex = classes.findIndex(customClass => customClass.id === id);
    
    if (classIndex === -1) {
      return false;
    }

    // Create backup before deletion
    await this.fileStorage.backupCustomUnitClasses();
    
    classes.splice(classIndex, 1);
    await this.fileStorage.writeCustomUnitClasses(classes);
    
    return true;
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const classes = await this.fileStorage.readCustomUnitClasses();
    return classes.some(customClass => 
      customClass.name.toLowerCase() === name.toLowerCase() &&
      customClass.id !== excludeId
    );
  }

  async search(query: string): Promise<CustomUnitClass[]> {
    const classes = await this.fileStorage.readCustomUnitClasses();
    const searchTerm = query.toLowerCase();
    
    return classes.filter(customClass =>
      customClass.name.toLowerCase().includes(searchTerm)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }
}