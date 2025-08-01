"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorage = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class FileStorage {
    constructor() {
        this.dataDir = path_1.default.join(process.cwd(), 'data');
        this.projectsFile = path_1.default.join(this.dataDir, 'projects.json');
        this.companyProfilesFile = path_1.default.join(this.dataDir, 'company-profile.json');
        this.debtEquityClassesFile = path_1.default.join(this.dataDir, 'debt-equity-classes.json');
        this.customUnitClassesFile = path_1.default.join(this.dataDir, 'custom-unit-classes.json');
    }
    async ensureDataDirectory() {
        try {
            await promises_1.default.access(this.dataDir);
        }
        catch {
            await promises_1.default.mkdir(this.dataDir, { recursive: true });
        }
    }
    async ensureProjectsFile() {
        await this.ensureDataDirectory();
        try {
            await promises_1.default.access(this.projectsFile);
        }
        catch {
            await promises_1.default.writeFile(this.projectsFile, JSON.stringify([], null, 2));
        }
    }
    async readProjects() {
        await this.ensureProjectsFile();
        try {
            const data = await promises_1.default.readFile(this.projectsFile, 'utf-8');
            const projects = JSON.parse(data);
            return projects.map((project) => ({
                ...project,
                timeframe: {
                    startDate: new Date(project.timeframe.startDate),
                    endDate: new Date(project.timeframe.endDate)
                },
                createdAt: new Date(project.createdAt),
                updatedAt: new Date(project.updatedAt)
            }));
        }
        catch (error) {
            console.error('Error reading projects file:', error);
            throw new Error('Failed to read projects data');
        }
    }
    async writeProjects(projects) {
        await this.ensureDataDirectory();
        try {
            const serializedProjects = projects.map(project => ({
                ...project,
                timeframe: {
                    startDate: project.timeframe.startDate.toISOString(),
                    endDate: project.timeframe.endDate.toISOString()
                },
                createdAt: project.createdAt.toISOString(),
                updatedAt: project.updatedAt.toISOString()
            }));
            await promises_1.default.writeFile(this.projectsFile, JSON.stringify(serializedProjects, null, 2));
        }
        catch (error) {
            console.error('Error writing projects file:', error);
            throw new Error('Failed to write projects data');
        }
    }
    async backupProjects() {
        await this.ensureProjectsFile();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path_1.default.join(this.dataDir, `projects-backup-${timestamp}.json`);
        try {
            const data = await promises_1.default.readFile(this.projectsFile, 'utf-8');
            await promises_1.default.writeFile(backupFile, data);
            console.log(`Backup created: ${backupFile}`);
        }
        catch (error) {
            console.error('Error creating backup:', error);
        }
    }
    async getStorageStats() {
        await this.ensureProjectsFile();
        try {
            const stats = await promises_1.default.stat(this.projectsFile);
            const projects = await this.readProjects();
            return {
                totalProjects: projects.length,
                fileSize: stats.size,
                lastModified: stats.mtime
            };
        }
        catch (error) {
            console.error('Error getting storage stats:', error);
            throw new Error('Failed to get storage statistics');
        }
    }
    async ensureCompanyProfilesFile() {
        await this.ensureDataDirectory();
        try {
            await promises_1.default.access(this.companyProfilesFile);
        }
        catch {
            await promises_1.default.writeFile(this.companyProfilesFile, JSON.stringify([], null, 2));
        }
    }
    async readCompanyProfiles() {
        await this.ensureCompanyProfilesFile();
        try {
            const data = await promises_1.default.readFile(this.companyProfilesFile, 'utf-8');
            const profiles = JSON.parse(data);
            return profiles.map((profile) => ({
                ...profile,
                createdAt: new Date(profile.createdAt),
                updatedAt: new Date(profile.updatedAt)
            }));
        }
        catch (error) {
            console.error('Error reading company profiles file:', error);
            throw new Error('Failed to read company profiles data');
        }
    }
    async writeCompanyProfiles(profiles) {
        await this.ensureDataDirectory();
        try {
            const serializedProfiles = profiles.map(profile => ({
                ...profile,
                createdAt: profile.createdAt.toISOString(),
                updatedAt: profile.updatedAt.toISOString()
            }));
            await promises_1.default.writeFile(this.companyProfilesFile, JSON.stringify(serializedProfiles, null, 2));
        }
        catch (error) {
            console.error('Error writing company profiles file:', error);
            throw new Error('Failed to write company profiles data');
        }
    }
    async backupCompanyProfiles() {
        await this.ensureCompanyProfilesFile();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path_1.default.join(this.dataDir, `company-profiles-backup-${timestamp}.json`);
        try {
            const data = await promises_1.default.readFile(this.companyProfilesFile, 'utf-8');
            await promises_1.default.writeFile(backupFile, data);
            console.log(`Company profiles backup created: ${backupFile}`);
        }
        catch (error) {
            console.error('Error creating company profiles backup:', error);
        }
    }
    async ensureDebtEquityClassesFile() {
        await this.ensureDataDirectory();
        try {
            await promises_1.default.access(this.debtEquityClassesFile);
        }
        catch {
            await promises_1.default.writeFile(this.debtEquityClassesFile, JSON.stringify([], null, 2));
        }
    }
    async readDebtEquityClasses() {
        await this.ensureDebtEquityClassesFile();
        try {
            const data = await promises_1.default.readFile(this.debtEquityClassesFile, 'utf-8');
            const classes = JSON.parse(data);
            return classes.map((debtEquityClass) => ({
                ...debtEquityClass,
                createdAt: new Date(debtEquityClass.createdAt),
                updatedAt: new Date(debtEquityClass.updatedAt)
            }));
        }
        catch (error) {
            console.error('Error reading debt equity classes file:', error);
            throw new Error('Failed to read debt equity classes data');
        }
    }
    async writeDebtEquityClasses(classes) {
        await this.ensureDataDirectory();
        try {
            const serializedClasses = classes.map(debtEquityClass => ({
                ...debtEquityClass,
                createdAt: debtEquityClass.createdAt.toISOString(),
                updatedAt: debtEquityClass.updatedAt.toISOString()
            }));
            await promises_1.default.writeFile(this.debtEquityClassesFile, JSON.stringify(serializedClasses, null, 2));
        }
        catch (error) {
            console.error('Error writing debt equity classes file:', error);
            throw new Error('Failed to write debt equity classes data');
        }
    }
    async backupDebtEquityClasses() {
        await this.ensureDebtEquityClassesFile();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path_1.default.join(this.dataDir, `debt-equity-classes-backup-${timestamp}.json`);
        try {
            const data = await promises_1.default.readFile(this.debtEquityClassesFile, 'utf-8');
            await promises_1.default.writeFile(backupFile, data);
            console.log(`Debt equity classes backup created: ${backupFile}`);
        }
        catch (error) {
            console.error('Error creating debt equity classes backup:', error);
        }
    }
    async ensureCustomUnitClassesFile() {
        await this.ensureDataDirectory();
        try {
            await promises_1.default.access(this.customUnitClassesFile);
        }
        catch {
            await promises_1.default.writeFile(this.customUnitClassesFile, JSON.stringify([], null, 2));
        }
    }
    async readCustomUnitClasses() {
        await this.ensureCustomUnitClassesFile();
        try {
            const data = await promises_1.default.readFile(this.customUnitClassesFile, 'utf-8');
            const classes = JSON.parse(data);
            return classes.map((customClass) => ({
                ...customClass,
                createdAt: new Date(customClass.createdAt)
            }));
        }
        catch (error) {
            console.error('Error reading custom unit classes file:', error);
            throw new Error('Failed to read custom unit classes data');
        }
    }
    async writeCustomUnitClasses(classes) {
        await this.ensureDataDirectory();
        try {
            const serializedClasses = classes.map(customClass => ({
                ...customClass,
                createdAt: customClass.createdAt.toISOString()
            }));
            await promises_1.default.writeFile(this.customUnitClassesFile, JSON.stringify(serializedClasses, null, 2));
        }
        catch (error) {
            console.error('Error writing custom unit classes file:', error);
            throw new Error('Failed to write custom unit classes data');
        }
    }
    async backupCustomUnitClasses() {
        await this.ensureCustomUnitClassesFile();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path_1.default.join(this.dataDir, `custom-unit-classes-backup-${timestamp}.json`);
        try {
            const data = await promises_1.default.readFile(this.customUnitClassesFile, 'utf-8');
            await promises_1.default.writeFile(backupFile, data);
            console.log(`Custom unit classes backup created: ${backupFile}`);
        }
        catch (error) {
            console.error('Error creating custom unit classes backup:', error);
        }
    }
}
exports.FileStorage = FileStorage;
//# sourceMappingURL=fileStorage.js.map