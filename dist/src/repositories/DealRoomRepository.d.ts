import { DealRoom, DealRoomCreateData, DealRoomUpdateData, ShowcasePhoto } from '../models/DealRoom';
export declare class DealRoomRepository {
    private dataPath;
    private uploadsPath;
    constructor();
    ensureDataFileExists(): Promise<void>;
    ensureUploadsDirectoryExists(): Promise<void>;
    readDealRooms(): Promise<DealRoom[]>;
    writeDealRooms(dealRooms: DealRoom[]): Promise<void>;
    findByProjectId(projectId: string): Promise<DealRoom | null>;
    findById(id: string): Promise<DealRoom | null>;
    create(data: DealRoomCreateData): Promise<DealRoom>;
    update(projectId: string, data: DealRoomUpdateData): Promise<DealRoom>;
    delete(projectId: string): Promise<boolean>;
    saveShowcasePhoto(projectId: string, file: Buffer, originalName: string, mimeType: string): Promise<ShowcasePhoto>;
    deleteShowcasePhotoFile(filename: string): Promise<void>;
    getShowcasePhotoPath(filename: string): Promise<string>;
    private generateId;
    private generateItemId;
    private generatePhotoFilename;
}
//# sourceMappingURL=DealRoomRepository.d.ts.map