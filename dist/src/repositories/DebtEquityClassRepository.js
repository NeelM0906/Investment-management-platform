"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebtEquityClassRepository = void 0;
const fileStorage_1 = require("../utils/fileStorage");
const uuid_1 = require("uuid");
class DebtEquityClassRepository {
    constructor() {
        this.fileStorage = new fileStorage_1.FileStorage();
    }
    async create(projectId, classData) {
        const classes = await this.fileStorage.readDebtEquityClasses();
        const newClass = {
            id: (0, uuid_1.v4)(),
            projectId,
            ...classData,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        classes.push(newClass);
        await this.fileStorage.writeDebtEquityClasses(classes);
        return newClass;
    }
    async findById(id) {
        const classes = await this.fileStorage.readDebtEquityClasses();
        return classes.find(debtEquityClass => debtEquityClass.id === id) || null;
    }
    async findByProjectId(projectId) {
        const classes = await this.fileStorage.readDebtEquityClasses();
        return classes.filter(debtEquityClass => debtEquityClass.projectId === projectId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async update(id, updateData) {
        const classes = await this.fileStorage.readDebtEquityClasses();
        const classIndex = classes.findIndex(debtEquityClass => debtEquityClass.id === id);
        if (classIndex === -1) {
            return null;
        }
        const updatedClass = {
            ...classes[classIndex],
            ...updateData,
            updatedAt: new Date()
        };
        classes[classIndex] = updatedClass;
        await this.fileStorage.writeDebtEquityClasses(classes);
        return updatedClass;
    }
    async delete(id) {
        const classes = await this.fileStorage.readDebtEquityClasses();
        const classIndex = classes.findIndex(debtEquityClass => debtEquityClass.id === id);
        if (classIndex === -1) {
            return false;
        }
        await this.fileStorage.backupDebtEquityClasses();
        classes.splice(classIndex, 1);
        await this.fileStorage.writeDebtEquityClasses(classes);
        return true;
    }
    async deleteByProjectId(projectId) {
        const classes = await this.fileStorage.readDebtEquityClasses();
        const initialCount = classes.length;
        const filteredClasses = classes.filter(debtEquityClass => debtEquityClass.projectId !== projectId);
        if (filteredClasses.length !== initialCount) {
            await this.fileStorage.backupDebtEquityClasses();
            await this.fileStorage.writeDebtEquityClasses(filteredClasses);
        }
        return initialCount - filteredClasses.length;
    }
    async countByProjectId(projectId) {
        const classes = await this.fileStorage.readDebtEquityClasses();
        return classes.filter(debtEquityClass => debtEquityClass.projectId === projectId).length;
    }
    async findByUnitClass(unitClass, projectId) {
        const classes = await this.fileStorage.readDebtEquityClasses();
        return classes.filter(debtEquityClass => debtEquityClass.unitClass.toLowerCase() === unitClass.toLowerCase() &&
            (!projectId || debtEquityClass.projectId === projectId));
    }
}
exports.DebtEquityClassRepository = DebtEquityClassRepository;
//# sourceMappingURL=DebtEquityClassRepository.js.map