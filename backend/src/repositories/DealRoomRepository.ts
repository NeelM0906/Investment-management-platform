import fs from 'fs/promises';
import path from 'path';
import { DealRoom, DealRoomCreateData, DealRoomUpdateData, ShowcasePhoto } from '../models/DealRoom';

export class DealRoomRepository {
  private dataPath: string;
  private uploadsPath: string;

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'deal-rooms.json');
    this.uploadsPath = path.join(process.cwd(), 'uploads', 'deal-room-images');
  }

  async ensureDataFileExists(): Promise<void> {
    try {
      await fs.access(this.dataPath);
    } catch {
      // File doesn't exist, create it with empty array
      await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
      await fs.writeFile(this.dataPath, JSON.stringify([], null, 2));
    }
  }

  async ensureUploadsDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.uploadsPath);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(this.uploadsPath, { recursive: true });
    }
  }

  async readDealRooms(): Promise<DealRoom[]> {
    await this.ensureDataFileExists();
    
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const dealRooms = JSON.parse(data);
      
      // Convert date strings back to Date objects
      return dealRooms.map((dealRoom: any) => ({
        ...dealRoom,
        createdAt: new Date(dealRoom.createdAt),
        updatedAt: new Date(dealRoom.updatedAt),
        showcasePhoto: dealRoom.showcasePhoto ? {
          ...dealRoom.showcasePhoto,
          uploadedAt: new Date(dealRoom.showcasePhoto.uploadedAt)
        } : undefined
      }));
    } catch (error) {
      console.error('Error reading deal rooms data:', error);
      return [];
    }
  }

  async writeDealRooms(dealRooms: DealRoom[]): Promise<void> {
    try {
      await fs.writeFile(this.dataPath, JSON.stringify(dealRooms, null, 2));
    } catch (error) {
      console.error('Error writing deal rooms data:', error);
      throw new Error('Failed to save deal room data');
    }
  }

  async findByProjectId(projectId: string): Promise<DealRoom | null> {
    const dealRooms = await this.readDealRooms();
    return dealRooms.find(dealRoom => dealRoom.projectId === projectId) || null;
  }

  async findById(id: string): Promise<DealRoom | null> {
    const dealRooms = await this.readDealRooms();
    return dealRooms.find(dealRoom => dealRoom.id === id) || null;
  }

  async create(data: DealRoomCreateData): Promise<DealRoom> {
    const dealRooms = await this.readDealRooms();
    
    // Check if deal room already exists for this project
    const existingDealRoom = dealRooms.find(dr => dr.projectId === data.projectId);
    if (existingDealRoom) {
      throw new Error('Deal room already exists for this project');
    }

    const now = new Date();
    const newDealRoom: DealRoom = {
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

  async update(projectId: string, data: DealRoomUpdateData): Promise<DealRoom> {
    const dealRooms = await this.readDealRooms();
    const dealRoomIndex = dealRooms.findIndex(dr => dr.projectId === projectId);
    
    if (dealRoomIndex === -1) {
      throw new Error('Deal room not found');
    }

    const existingDealRoom = dealRooms[dealRoomIndex];
    const now = new Date();

    // Update the deal room with new data
    const updatedDealRoom: DealRoom = {
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

  async delete(projectId: string): Promise<boolean> {
    const dealRooms = await this.readDealRooms();
    const dealRoomIndex = dealRooms.findIndex(dr => dr.projectId === projectId);
    
    if (dealRoomIndex === -1) {
      return false;
    }

    const dealRoom = dealRooms[dealRoomIndex];
    
    // Delete showcase photo file if it exists
    if (dealRoom.showcasePhoto) {
      await this.deleteShowcasePhotoFile(dealRoom.showcasePhoto.filename);
    }

    dealRooms.splice(dealRoomIndex, 1);
    await this.writeDealRooms(dealRooms);
    
    return true;
  }

  async saveShowcasePhoto(projectId: string, file: Buffer, originalName: string, mimeType: string): Promise<ShowcasePhoto> {
    await this.ensureUploadsDirectoryExists();
    
    const filename = this.generatePhotoFilename(originalName);
    const filePath = path.join(this.uploadsPath, filename);
    
    try {
      await fs.writeFile(filePath, file);
      
      const showcasePhoto: ShowcasePhoto = {
        filename,
        originalName,
        mimeType,
        size: file.length,
        uploadedAt: new Date()
      };

      return showcasePhoto;
    } catch (error) {
      console.error('Error saving showcase photo:', error);
      throw new Error('Failed to save showcase photo');
    }
  }

  async deleteShowcasePhotoFile(filename: string): Promise<void> {
    const filePath = path.join(this.uploadsPath, filename);
    
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, which is okay
      console.warn('Could not delete showcase photo file:', filename, error);
    }
  }

  async getShowcasePhotoPath(filename: string): Promise<string> {
    return path.join(this.uploadsPath, filename);
  }

  private generateId(): string {
    return 'dr_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private generateItemId(): string {
    return 'item_' + Math.random().toString(36).substr(2, 9);
  }

  private generatePhotoFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const extension = path.extname(originalName);
    return `showcase_${timestamp}_${random}${extension}`;
  }
}