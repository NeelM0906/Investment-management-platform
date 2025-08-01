import { Project, CompanyProfile, DebtEquityClass, CustomUnitClass } from '../types';
export declare class FileStorage {
    private dataDir;
    private projectsFile;
    private companyProfilesFile;
    private debtEquityClassesFile;
    private customUnitClassesFile;
    constructor();
    ensureDataDirectory(): Promise<void>;
    ensureProjectsFile(): Promise<void>;
    readProjects(): Promise<Project[]>;
    writeProjects(projects: Project[]): Promise<void>;
    backupProjects(): Promise<void>;
    getStorageStats(): Promise<{
        totalProjects: number;
        fileSize: number;
        lastModified: Date;
    }>;
    ensureCompanyProfilesFile(): Promise<void>;
    readCompanyProfiles(): Promise<CompanyProfile[]>;
    writeCompanyProfiles(profiles: CompanyProfile[]): Promise<void>;
    backupCompanyProfiles(): Promise<void>;
    ensureDebtEquityClassesFile(): Promise<void>;
    readDebtEquityClasses(): Promise<DebtEquityClass[]>;
    writeDebtEquityClasses(classes: DebtEquityClass[]): Promise<void>;
    backupDebtEquityClasses(): Promise<void>;
    ensureCustomUnitClassesFile(): Promise<void>;
    readCustomUnitClasses(): Promise<CustomUnitClass[]>;
    writeCustomUnitClasses(classes: CustomUnitClass[]): Promise<void>;
    backupCustomUnitClasses(): Promise<void>;
}
//# sourceMappingURL=fileStorage.d.ts.map