"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentRepository = void 0;
const fileStorage_1 = require("../utils/fileStorage");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class DocumentRepository {
    constructor() {
        this.fileStorage = new fileStorage_1.FileStorage('data/documents.json');
        this.uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
        this.ensureUploadsDirectory();
    }
    ensureUploadsDirectory() {
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }
    async findAll(filters) {
        let documents = await this.fileStorage.readAll();
        if (filters?.projectId) {
            documents = documents.filter(doc => doc.projectId === filters.projectId);
        }
        if (filters?.search) {
            const searchTerm = filters.search.toLowerCase();
            documents = documents.filter(doc => doc.customName.toLowerCase().includes(searchTerm) ||
                doc.originalName.toLowerCase().includes(searchTerm));
        }
        if (filters?.fileType) {
            documents = documents.filter(doc => doc.mimeType.includes(filters.fileType));
        }
        if (filters?.sortBy) {
            documents.sort((a, b) => {
                let aValue = a[filters.sortBy];
                let bValue = b[filters.sortBy];
                if (filters.sortBy === 'uploadedAt') {
                    aValue = new Date(aValue).getTime();
                    bValue = new Date(bValue).getTime();
                }
                if (filters.sortBy === 'fileSize') {
                    return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
                }
                if (typeof aValue === 'string') {
                    return filters.sortOrder === 'desc'
                        ? bValue.localeCompare(aValue)
                        : aValue.localeCompare(bValue);
                }
                return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
            });
        }
        else {
            documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        }
        return documents;
    }
    async findById(id) {
        const documents = await this.fileStorage.readAll();
        return documents.find(doc => doc.id === id) || null;
    }
    async findByProjectId(projectId) {
        return this.findAll({ projectId });
    }
    async create(documentData) {
        const documents = await this.fileStorage.readAll();
        const newDocument = {
            id: (0, uuid_1.v4)(),
            ...documentData,
            uploadedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        documents.push(newDocument);
        await this.fileStorage.writeAll(documents);
        return newDocument;
    }
    async update(id, documentData) {
        const documents = await this.fileStorage.readAll();
        const documentIndex = documents.findIndex(doc => doc.id === id);
        if (documentIndex === -1) {
            return null;
        }
        const updatedDocument = {
            ...documents[documentIndex],
            ...documentData,
            updatedAt: new Date().toISOString()
        };
        documents[documentIndex] = updatedDocument;
        await this.fileStorage.writeAll(documents);
        return updatedDocument;
    }
    async delete(id) {
        const documents = await this.fileStorage.readAll();
        const documentIndex = documents.findIndex(doc => doc.id === id);
        if (documentIndex === -1) {
            return false;
        }
        const document = documents[documentIndex];
        const filePath = path.join(this.uploadsDir, document.fileName);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        catch (error) {
            console.error('Error deleting file:', error);
        }
        documents.splice(documentIndex, 1);
        await this.fileStorage.writeAll(documents);
        return true;
    }
    async getProjectDocumentSummaries() {
        const documents = await this.fileStorage.readAll();
        const projectMap = new Map();
        documents.forEach(doc => {
            if (!projectMap.has(doc.projectId)) {
                projectMap.set(doc.projectId, []);
            }
            projectMap.get(doc.projectId).push(doc);
        });
        const summaries = [];
        for (const [projectId, projectDocs] of projectMap.entries()) {
            const sortedDocs = projectDocs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
            const totalSize = projectDocs.reduce((sum, doc) => sum + doc.fileSize, 0);
            const lastUpload = sortedDocs.length > 0 ? sortedDocs[0].uploadedAt : undefined;
            summaries.push({
                projectId,
                projectName: '',
                documentCount: projectDocs.length,
                totalSize,
                lastUpload,
                recentDocuments: sortedDocs.slice(0, 3)
            });
        }
        return summaries.sort((a, b) => {
            if (!a.lastUpload && !b.lastUpload)
                return 0;
            if (!a.lastUpload)
                return 1;
            if (!b.lastUpload)
                return -1;
            return new Date(b.lastUpload).getTime() - new Date(a.lastUpload).getTime();
        });
    }
    async count() {
        const documents = await this.fileStorage.readAll();
        return documents.length;
    }
    async countByProject(projectId) {
        const documents = await this.findByProjectId(projectId);
        return documents.length;
    }
    getFilePath(fileName) {
        return path.join(this.uploadsDir, fileName);
    }
}
exports.DocumentRepository = DocumentRepository;
//# sourceMappingURL=DocumentRepository.js.map