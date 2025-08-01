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
exports.DocumentService = void 0;
const Document_1 = require("../models/Document");
const DocumentRepository_1 = require("../repositories/DocumentRepository");
const ProjectService_1 = require("./ProjectService");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const uuid_1 = require("uuid");
class DocumentService {
    constructor() {
        this.documentRepository = new DocumentRepository_1.DocumentRepository();
        this.projectService = new ProjectService_1.ProjectService();
    }
    async getAllDocuments(filters) {
        return await this.documentRepository.findAll(filters);
    }
    async getDocument(id) {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Document ID is required');
        }
        const document = await this.documentRepository.findById(id);
        if (!document) {
            throw new Error('Document not found');
        }
        return document;
    }
    async getDocumentsByProject(projectId) {
        if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        try {
            await this.projectService.getProject(projectId);
        }
        catch (error) {
            throw new Error('Project not found');
        }
        return await this.documentRepository.findByProjectId(projectId);
    }
    async uploadDocument(file, customName, projectId) {
        if (!file) {
            throw new Error('No file provided');
        }
        if (!customName || customName.trim() === '') {
            throw new Error('Custom name is required');
        }
        if (!projectId || projectId.trim() === '') {
            throw new Error('Project ID is required');
        }
        try {
            await this.projectService.getProject(projectId);
        }
        catch (error) {
            throw new Error('Project not found');
        }
        this.validateFile(file);
        const fileExtension = path.extname(file.originalname);
        const fileName = `${(0, uuid_1.v4)()}${fileExtension}`;
        const filePath = this.documentRepository.getFilePath(fileName);
        try {
            fs.writeFileSync(filePath, file.buffer);
            const document = await this.documentRepository.create({
                projectId,
                originalName: file.originalname,
                customName: customName.trim(),
                fileName,
                fileSize: file.size,
                mimeType: file.mimetype,
                fileExtension
            });
            return document;
        }
        catch (error) {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
            throw new Error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async updateDocument(id, updates) {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Document ID is required');
        }
        if (updates.customName !== undefined) {
            if (!updates.customName || updates.customName.trim() === '') {
                throw new Error('Custom name cannot be empty');
            }
            updates.customName = updates.customName.trim();
        }
        const updatedDocument = await this.documentRepository.update(id, updates);
        if (!updatedDocument) {
            throw new Error('Document not found');
        }
        return updatedDocument;
    }
    async deleteDocument(id) {
        if (!id || typeof id !== 'string' || id.trim() === '') {
            throw new Error('Document ID is required');
        }
        const deleted = await this.documentRepository.delete(id);
        if (!deleted) {
            throw new Error('Document not found');
        }
    }
    async getProjectDocumentSummaries() {
        const summaries = await this.documentRepository.getProjectDocumentSummaries();
        for (const summary of summaries) {
            try {
                const project = await this.projectService.getProject(summary.projectId);
                summary.projectName = project.projectName;
            }
            catch (error) {
                summary.projectName = 'Unknown Project';
            }
        }
        return summaries;
    }
    async getDocumentFilePath(id) {
        const document = await this.getDocument(id);
        const filePath = this.documentRepository.getFilePath(document.fileName);
        if (!fs.existsSync(filePath)) {
            throw new Error('Document file not found on disk');
        }
        return filePath;
    }
    async getDocumentsCount() {
        return await this.documentRepository.count();
    }
    async getDocumentsCountByProject(projectId) {
        return await this.documentRepository.countByProject(projectId);
    }
    async searchDocuments(searchTerm) {
        if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
            return await this.getAllDocuments();
        }
        return await this.documentRepository.findAll({ search: searchTerm.trim() });
    }
    validateFile(file) {
        if (file.size > Document_1.MAX_FILE_SIZE) {
            throw new Error(`File size exceeds maximum limit of ${Math.round(Document_1.MAX_FILE_SIZE / (1024 * 1024))}MB`);
        }
        if (!Document_1.SUPPORTED_FILE_TYPES[file.mimetype]) {
            const supportedExtensions = Object.values(Document_1.SUPPORTED_FILE_TYPES).join(', ');
            throw new Error(`Unsupported file type. Supported formats: ${supportedExtensions}`);
        }
        if (file.size === 0) {
            throw new Error('File is empty');
        }
    }
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=DocumentService.js.map