export interface Project {
    id: string;
    projectName: string;
    legalProjectName: string;
    unitCalculationPrecision: number;
    targetAmount: number;
    minimumInvestment?: number;
    currency: string;
    timeframe: {
        startDate: Date;
        endDate: Date;
    };
    commitments: {
        totalAmount: number;
        investorCount: number;
    };
    reservations: {
        totalAmount: number;
        investorCount: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface ProjectFormData {
    projectName: string;
    legalProjectName: string;
    unitCalculationPrecision: number;
    targetAmount: number;
    minimumInvestment?: number;
    currency: string;
    startDate: string;
    endDate: string;
}
export interface ProjectFilters {
    searchTerm: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
    fundingStatus?: 'all' | 'funded' | 'partial' | 'unfunded';
}
export interface CommitmentReservationData {
    commitments: {
        totalAmount: number;
        investorCount: number;
    };
    reservations: {
        totalAmount: number;
        investorCount: number;
    };
}
export interface ProjectKPIs {
    totalCommitments: number;
    totalCommittedAmount: number;
    fundingPercentage: number;
    daysRemaining: number;
    currency: string;
}
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ErrorResponse;
}
export interface ErrorResponse {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}
export interface ProjectEntity {
    id: string;
    project_name: string;
    legal_project_name: string;
    unit_calculation_precision: number;
    target_amount: number;
    currency: string;
    start_date: Date;
    end_date: Date;
    created_at: Date;
    updated_at: Date;
}
export interface IProjectRepository {
    create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
    findById(id: string): Promise<Project | null>;
    findAll(filters: ProjectFilters, pagination: PaginationParams): Promise<PaginatedResponse<Project>>;
    update(id: string, project: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Project | null>;
    delete(id: string): Promise<boolean>;
    existsByName(projectName: string, excludeId?: string): Promise<boolean>;
}
export interface IProjectService {
    createProject(projectData: ProjectFormData): Promise<Project>;
    getProject(id: string): Promise<Project>;
    getAllProjects(filters: ProjectFilters, pagination: PaginationParams): Promise<PaginatedResponse<Project>>;
    updateProject(id: string, projectData: Partial<ProjectFormData>): Promise<Project>;
    deleteProject(id: string): Promise<void>;
    validateProjectData(projectData: ProjectFormData): Promise<void>;
}
export interface CompanyProfile {
    id: string;
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phoneNumber: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CompanyProfileFormData {
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phoneNumber: string;
}
export interface ICompanyProfileRepository {
    create(profile: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyProfile>;
    findById(id: string): Promise<CompanyProfile | null>;
    findFirst(): Promise<CompanyProfile | null>;
    update(id: string, profile: Partial<Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>>): Promise<CompanyProfile | null>;
    delete(id: string): Promise<boolean>;
}
export interface ICompanyProfileService {
    createProfile(profileData: CompanyProfileFormData): Promise<CompanyProfile>;
    getProfile(id: string): Promise<CompanyProfile>;
    getDefaultProfile(): Promise<CompanyProfile | null>;
    updateProfile(id: string, profileData: Partial<CompanyProfileFormData>): Promise<CompanyProfile>;
    deleteProfile(id: string): Promise<void>;
    validateProfileData(profileData: CompanyProfileFormData): Promise<void>;
}
export interface DebtEquityClass {
    id: string;
    projectId: string;
    unitClass: string;
    unitPrice: number;
    isOpenToInvestments: boolean;
    investmentIncrementAmount: number;
    minInvestmentAmount: number;
    maxInvestmentAmount: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface DebtEquityClassFormData {
    unitClass: string;
    unitPrice: number;
    isOpenToInvestments: boolean;
    investmentIncrementAmount: number;
    minInvestmentAmount: number;
    maxInvestmentAmount: number;
}
export interface CustomUnitClass {
    id: string;
    name: string;
    createdAt: Date;
}
export interface CustomUnitClassFormData {
    name: string;
}
export interface IDebtEquityClassRepository {
    create(projectId: string, classData: Omit<DebtEquityClass, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>): Promise<DebtEquityClass>;
    findById(id: string): Promise<DebtEquityClass | null>;
    findByProjectId(projectId: string): Promise<DebtEquityClass[]>;
    update(id: string, classData: Partial<Omit<DebtEquityClass, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>): Promise<DebtEquityClass | null>;
    delete(id: string): Promise<boolean>;
    deleteByProjectId(projectId: string): Promise<number>;
    countByProjectId(projectId: string): Promise<number>;
    findByUnitClass(unitClass: string, projectId?: string): Promise<DebtEquityClass[]>;
}
export interface ICustomUnitClassRepository {
    create(classData: Omit<CustomUnitClass, 'id' | 'createdAt'>): Promise<CustomUnitClass>;
    findById(id: string): Promise<CustomUnitClass | null>;
    findAll(): Promise<CustomUnitClass[]>;
    findByName(name: string): Promise<CustomUnitClass | null>;
    delete(id: string): Promise<boolean>;
    existsByName(name: string, excludeId?: string): Promise<boolean>;
    search(query: string): Promise<CustomUnitClass[]>;
}
export interface IDebtEquityClassService {
    createClass(projectId: string, classData: DebtEquityClassFormData): Promise<DebtEquityClass>;
    getClass(id: string): Promise<DebtEquityClass>;
    getClassesByProject(projectId: string): Promise<DebtEquityClass[]>;
    updateClass(id: string, classData: Partial<DebtEquityClassFormData>): Promise<DebtEquityClass>;
    deleteClass(id: string): Promise<void>;
    validateClassData(classData: DebtEquityClassFormData): Promise<void>;
}
export interface ICustomUnitClassService {
    createCustomClass(classData: CustomUnitClassFormData): Promise<CustomUnitClass>;
    getCustomClass(id: string): Promise<CustomUnitClass>;
    getAllCustomClasses(): Promise<CustomUnitClass[]>;
    deleteCustomClass(id: string): Promise<void>;
    validateCustomClassData(classData: CustomUnitClassFormData): Promise<void>;
}
export interface Contact {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    fax?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ContactFormData {
    firstName: string;
    middleName?: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    fax?: string;
}
export interface ContactFilters {
    search?: string;
    sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}
export interface Document {
    id: string;
    projectId: string;
    originalName: string;
    customName: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    fileExtension: string;
    uploadedAt: string;
    updatedAt: string;
}
export interface DocumentFormData {
    projectId: string;
    customName: string;
    file: File;
}
export interface DocumentFilters {
    projectId?: string;
    search?: string;
    fileType?: string;
    sortBy?: 'customName' | 'originalName' | 'uploadedAt' | 'fileSize';
    sortOrder?: 'asc' | 'desc';
}
export interface ProjectDocumentSummary {
    projectId: string;
    projectName: string;
    documentCount: number;
    totalSize: number;
    lastUpload?: string;
    recentDocuments: Document[];
}
//# sourceMappingURL=index.d.ts.map