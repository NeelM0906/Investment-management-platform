"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealRoomRepository = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class DealRoomRepository {
    constructor() {
        this.dataPath = path_1.default.join(process.cwd(), 'data', 'deal-rooms.json');
        this.uploadsPath = path_1.default.join(process.cwd(), 'uploads', 'deal-room-images');
    }
    async ensureDataFileExists() {
        try {
            await promises_1.default.access(this.dataPath);
        }
        catch {
            await promises_1.default.mkdir(path_1.default.dirname(this.dataPath), { recursive: true });
            await promises_1.default.writeFile(this.dataPath, JSON.stringify([], null, 2));
        }
    }
    async ensureUploadsDirectoryExists() {
        try {
            await promises_1.default.access(this.uploadsPath);
        }
        catch {
            await promises_1.default.mkdir(this.uploadsPath, { recursive: true });
        }
    }
    async readDealRooms() {
        await this.ensureDataFileExists();
        try {
            const data = await promises_1.default.readFile(this.dataPath, 'utf-8');
            const dealRooms = JSON.parse(data);
            return dealRooms.map((dealRoom) => ({
                ...dealRoom,
                createdAt: new Date(dealRoom.createdAt),
                updatedAt: new Date(dealRoom.updatedAt),
                showcasePhoto: dealRoom.showcasePhoto ? {
                    ...dealRoom.showcasePhoto,
                    uploadedAt: new Date(dealRoom.showcasePhoto.uploadedAt)
                } : undefined
            }));
        }
        catch (error) {
            console.error('Error reading deal rooms data:', error);
            return [];
        }
    }
    async writeDealRooms(dealRooms) {
        try {
            await promises_1.default.writeFile(this.dataPath, JSON.stringify(dealRooms, null, 2));
        }
        catch (error) {
            console.error('Error writing deal rooms data:', error);
            throw new Error('Failed to save deal room data');
        }
    }
    async findByProjectId(projectId) {
        const dealRooms = await this.readDealRooms();
        return dealRooms.find(dealRoom => dealRoom.projectId === projectId) || null;
    }
    async findById(id) {
        const dealRooms = await this.readDealRooms();
        return dealRooms.find(dealRoom => dealRoom.id === id) || null;
    }
    async create(data) {
        const dealRooms = await this.readDealRooms();
        const existingDealRoom = dealRooms.find(dr => dr.projectId === data.projectId);
        if (existingDealRoom) {
            throw new Error('Deal room already exists for this project');
        }
        const now = new Date();
        const newDealRoom = {
            id: this.generateId(),
            projectId: data.projectId,
            showcasePhoto: data.showcasePhoto,
            investmentBlurb: data.investmentBlurb || '',
            investmentSummary: data.investmentSummary || '',
            keyInfo: data.keyInfo?.map((item, index) => ({
                id: this.generateItemId(),
                name: item.name,
                link: item.link,
                order: item.order ?? index
            })) || [],
            externalLinks: data.externalLinks?.map((link, index) => ({
                id: this.generateItemId(),
                name: link.name,
                url: link.url,
                order: link.order ?? index
            })) || [],
            createdAt: now,
            updatedAt: now
        };
        dealRooms.push(newDealRoom);
        await this.writeDealRooms(dealRooms);
        return newDealRoom;
    }
    async update(projectId, data) {
        const dealRooms = await this.readDealRooms();
        const dealRoomIndex = dealRooms.findIndex(dr => dr.projectId === projectId);
        if (dealRoomIndex === -1) {
            throw new Error('Deal room not found');
        }
        const existingDealRoom = dealRooms[dealRoomIndex];
        const now = new Date();
        const updatedDealRoom = {
            ...existingDealRoom,
            showcasePhoto: data.showcasePhoto !== undefined ? data.showcasePhoto : existingDealRoom.showcasePhoto,
            investmentBlurb: data.investmentBlurb !== undefined ? data.investmentBlurb : existingDealRoom.investmentBlurb,
            investmentSummary: data.investmentSummary !== undefined ? data.investmentSummary : existingDealRoom.investmentSummary,
            keyInfo: data.keyInfo !== undefined ? data.keyInfo.map((item, index) => ({
                id: this.generateItemId(),
                name: item.name,
                link: item.link,
                order: item.order ?? index
            })) : existingDealRoom.keyInfo,
            externalLinks: data.externalLinks !== undefined ? data.externalLinks.map((link, index) => ({
                id: this.generateItemId(),
                name: link.name,
                url: link.url,
                order: link.order ?? index
            })) : existingDealRoom.externalLinks,
            updatedAt: now
        };
        dealRooms[dealRoomIndex] = updatedDealRoom;
        await this.writeDealRooms(dealRooms);
        return updatedDealRoom;
    }
    async delete(projectId) {
        const dealRooms = await this.readDealRooms();
        const dealRoomIndex = dealRooms.findIndex(dr => dr.projectId === projectId);
        if (dealRoomIndex === -1) {
            return false;
        }
        const dealRoom = dealRooms[dealRoomIndex];
        if (dealRoom.showcasePhoto) {
            await this.deleteShowcasePhotoFile(dealRoom.showcasePhoto.filename);
        }
        dealRooms.splice(dealRoomIndex, 1);
        await this.writeDealRooms(dealRooms);
        return true;
    }
    async saveShowcasePhoto(projectId, file, originalName, mimeType) {
        await this.ensureUploadsDirectoryExists();
        const filename = this.generatePhotoFilename(originalName);
        const filePath = path_1.default.join(this.uploadsPath, filename);
        try {
            await promises_1.default.writeFile(filePath, file);
            const showcasePhoto = {
                filename,
                originalName,
                mimeType,
                size: file.length,
                uploadedAt: new Date()
            };
            return showcasePhoto;
        }
        catch (error) {
            console.error('Error saving showcase photo:', error);
            throw new Error('Failed to save showcase photo');
        }
    }
    async deleteShowcasePhotoFile(filename) {
        const filePath = path_1.default.join(this.uploadsPath, filename);
        try {
            await promises_1.default.unlink(filePath);
        }
        catch (error) {
            console.warn('Could not delete showcase photo file:', filename, error);
        }
    }
    async getShowcasePhotoPath(filename) {
        return path_1.default.join(this.uploadsPath, filename);
    }
    generateId() {
        return 'dr_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
    generateItemId() {
        return 'item_' + Math.random().toString(36).substr(2, 9);
    }
    generatePhotoFilename(originalName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const extension = path_1.default.extname(originalName);
        return `showcase_${timestamp}_${random}${extension}`;
    }
}
exports.DealRoomRepository = DealRoomRepository;
//# sourceMappingURL=DealRoomRepository.js.map