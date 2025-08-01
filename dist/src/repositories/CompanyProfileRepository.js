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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyProfileRepository = void 0;
const fileStorage_1 = require("../utils/fileStorage");
const path_1 = __importDefault(require("path"));
class CompanyProfileRepository {
    constructor() {
        this.fileStorage = new fileStorage_1.FileStorage();
        this.profilesFile = path_1.default.join(process.cwd(), 'data', 'company-profile.json');
    }
    async create(profile) {
        const profiles = await this.readProfiles();
        const newProfile = {
            ...profile,
            id: this.generateId(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        profiles.push(newProfile);
        await this.writeProfiles(profiles);
        return newProfile;
    }
    async findById(id) {
        const profiles = await this.readProfiles();
        return profiles.find(profile => profile.id === id) || null;
    }
    async findFirst() {
        const profiles = await this.readProfiles();
        return profiles.length > 0 ? profiles[0] : null;
    }
    async update(id, profileData) {
        const profiles = await this.readProfiles();
        const profileIndex = profiles.findIndex(profile => profile.id === id);
        if (profileIndex === -1) {
            return null;
        }
        const updatedProfile = {
            ...profiles[profileIndex],
            ...profileData,
            updatedAt: new Date()
        };
        profiles[profileIndex] = updatedProfile;
        await this.writeProfiles(profiles);
        return updatedProfile;
    }
    async delete(id) {
        const profiles = await this.readProfiles();
        const initialLength = profiles.length;
        const filteredProfiles = profiles.filter(profile => profile.id !== id);
        if (filteredProfiles.length === initialLength) {
            return false;
        }
        await this.writeProfiles(filteredProfiles);
        return true;
    }
    async readProfiles() {
        try {
            await this.fileStorage.ensureDataDirectory();
            await this.ensureProfilesFile();
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const data = await fs.readFile(this.profilesFile, 'utf-8');
            const profiles = JSON.parse(data);
            return profiles.map((profile) => ({
                ...profile,
                createdAt: new Date(profile.createdAt),
                updatedAt: new Date(profile.updatedAt)
            }));
        }
        catch (error) {
            throw new Error(`Failed to read company profiles data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async writeProfiles(profiles) {
        try {
            await this.fileStorage.ensureDataDirectory();
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            await fs.writeFile(this.profilesFile, JSON.stringify(profiles, null, 2));
        }
        catch (error) {
            throw new Error(`Failed to write company profiles data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async ensureProfilesFile() {
        try {
            const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            await fs.access(this.profilesFile);
        }
        catch {
            await this.writeProfiles([]);
        }
    }
    generateId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
}
exports.CompanyProfileRepository = CompanyProfileRepository;
//# sourceMappingURL=CompanyProfileRepository.js.map