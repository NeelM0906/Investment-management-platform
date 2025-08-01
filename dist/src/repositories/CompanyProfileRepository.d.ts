import { CompanyProfile, ICompanyProfileRepository } from '../types';
export declare class CompanyProfileRepository implements ICompanyProfileRepository {
    private fileStorage;
    private profilesFile;
    constructor();
    create(profile: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyProfile>;
    findById(id: string): Promise<CompanyProfile | null>;
    findFirst(): Promise<CompanyProfile | null>;
    update(id: string, profileData: Partial<Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CompanyProfile | null>;
    delete(id: string): Promise<boolean>;
    private readProfiles;
    private writeProfiles;
    private ensureProfilesFile;
    private generateId;
}
//# sourceMappingURL=CompanyProfileRepository.d.ts.map