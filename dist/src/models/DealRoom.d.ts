export interface DealRoom {
    id: string;
    projectId: string;
    showcasePhoto?: ShowcasePhoto;
    investmentBlurb: string;
    investmentSummary: string;
    keyInfo: KeyInfoItem[];
    externalLinks: ExternalLink[];
    createdAt: Date;
    updatedAt: Date;
}
export interface ShowcasePhoto {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
}
export interface KeyInfoItem {
    id: string;
    name: string;
    link: string;
    order: number;
}
export interface ExternalLink {
    id: string;
    name: string;
    url: string;
    order: number;
}
export interface DealRoomFormData {
    showcasePhoto?: File;
    investmentBlurb: string;
    investmentSummary: string;
    keyInfo: Omit<KeyInfoItem, 'id'>[];
    externalLinks: Omit<ExternalLink, 'id'>[];
}
export interface DealRoomCreateData {
    projectId: string;
    showcasePhoto?: ShowcasePhoto;
    investmentBlurb: string;
    investmentSummary: string;
    keyInfo: Omit<KeyInfoItem, 'id'>[];
    externalLinks: Omit<ExternalLink, 'id'>[];
}
export interface DealRoomUpdateData {
    showcasePhoto?: ShowcasePhoto;
    investmentBlurb?: string;
    investmentSummary?: string;
    keyInfo?: Omit<KeyInfoItem, 'id'>[];
    externalLinks?: Omit<ExternalLink, 'id'>[];
}
export declare class DealRoomModel {
    static validate(data: Partial<DealRoomCreateData>): {
        isValid: boolean;
        errors: string[];
    };
    static isValidUrl(url: string): boolean;
    static isValidImageMimeType(mimeType: string): boolean;
    static createDefault(projectId: string): DealRoom;
    static generateId(): string;
    static generateItemId(): string;
}
//# sourceMappingURL=DealRoom.d.ts.map