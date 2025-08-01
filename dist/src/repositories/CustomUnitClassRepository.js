"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomUnitClassRepository = void 0;
const fileStorage_1 = require("../utils/fileStorage");
const uuid_1 = require("uuid");
class CustomUnitClassRepository {
    constructor() {
        this.fileStorage = new fileStorage_1.FileStorage();
    }
    async create(classData) {
        const classes = await this.fileStorage.readCustomUnitClasses();
        const existingClass = classes.find(c => c.name.toLowerCase() === classData.name.toLowerCase());
        if (existingClass) {
            throw new Error('A custom unit class with this name already exists');
        }
        const newClass = {
            id: (0, uuid_1.v4)(),
            ...classData,
            createdAt: new Date()
        };
        classes.push(newClass);
        await this.fileStorage.writeCustomUnitClasses(classes);
        return newClass;
    }
    async findById(id) {
        const classes = await this.fileStorage.readCustomUnitClasses();
        return classes.find(customClass => customClass.id === id) || null;
    }
    async findAll() {
        const classes = await this.fileStorage.readCustomUnitClasses();
        return classes.sort((a, b) => a.name.localeCompare(b.name));
    }
    async findByName(name) {
        const classes = await this.fileStorage.readCustomUnitClasses();
        return classes.find(customClass => customClass.name.toLowerCase() === name.toLowerCase()) || null;
    }
    async delete(id) {
        const classes = await this.fileStorage.readCustomUnitClasses();
        const classIndex = classes.findIndex(customClass => customClass.id === id);
        if (classIndex === -1) {
            return false;
        }
        await this.fileStorage.backupCustomUnitClasses();
        classes.splice(classIndex, 1);
        await this.fileStorage.writeCustomUnitClasses(classes);
        return true;
    }
    async existsByName(name, excludeId) {
        const classes = await this.fileStorage.readCustomUnitClasses();
        return classes.some(customClass => customClass.name.toLowerCase() === name.toLowerCase() &&
            customClass.id !== excludeId);
    }
    async search(query) {
        const classes = await this.fileStorage.readCustomUnitClasses();
        const searchTerm = query.toLowerCase();
        return classes.filter(customClass => customClass.name.toLowerCase().includes(searchTerm)).sort((a, b) => a.name.localeCompare(b.name));
    }
}
exports.CustomUnitClassRepository = CustomUnitClassRepository;
//# sourceMappingURL=CustomUnitClassRepository.js.map