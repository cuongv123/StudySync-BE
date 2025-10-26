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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const file_entity_1 = require("./entities/file.entity");
const user_storage_entity_1 = require("./entities/user-storage.entity");
const group_storage_entity_1 = require("./entities/group-storage.entity");
const group_member_entity_1 = require("../group/entities/group-member.entity");
const file_type_enum_1 = require("../../common/enums/file-type.enum");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let FileService = class FileService {
    constructor(fileRepository, userStorageRepository, groupStorageRepository, groupMemberRepository) {
        this.fileRepository = fileRepository;
        this.userStorageRepository = userStorageRepository;
        this.groupStorageRepository = groupStorageRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.MAX_PERSONAL_SIZE = 104857600;
        this.MAX_GROUP_SIZE = 1073741824;
        this.UPLOAD_DIR = path.join(process.cwd(), 'uploads');
    }
    async uploadFile(file, uploadDto, userId) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (uploadDto.type === file_type_enum_1.FileType.GROUP) {
            if (!uploadDto.groupId) {
                throw new common_1.BadRequestException('Group ID is required for group files');
            }
            await this.validateGroupMember(userId, uploadDto.groupId);
        }
        const maxSize = uploadDto.type === file_type_enum_1.FileType.PERSONAL
            ? this.MAX_PERSONAL_SIZE
            : this.MAX_GROUP_SIZE;
        if (file.size > maxSize) {
            const limit = uploadDto.type === file_type_enum_1.FileType.PERSONAL ? '100MB' : '1GB';
            throw new common_1.BadRequestException(`File size exceeds ${limit} limit for ${uploadDto.type} files`);
        }
        await this.checkStorageQuota(userId, uploadDto.type, uploadDto.groupId, file.size);
        if (uploadDto.parentId) {
            await this.validateParentFolder(uploadDto.parentId, userId, uploadDto.groupId);
        }
        const fileEntity = this.fileRepository.create({
            name: uploadDto.customName || file.originalname,
            originalName: file.originalname,
            path: file.path,
            url: this.generateFileUrl(file.filename),
            size: file.size,
            mimeType: file.mimetype,
            type: uploadDto.type,
            uploaderId: userId,
            groupId: uploadDto.groupId,
            parentId: uploadDto.parentId,
            isFolder: false,
        });
        const savedFile = await this.fileRepository.save(fileEntity);
        await this.updateStorageUsage(userId, uploadDto.type, uploadDto.groupId, file.size);
        return savedFile;
    }
    async createFolder(createFolderDto, userId) {
        if (createFolderDto.groupId) {
            await this.validateGroupMember(userId, createFolderDto.groupId);
        }
        if (createFolderDto.parentId) {
            await this.validateParentFolder(createFolderDto.parentId, userId, createFolderDto.groupId);
        }
        const folder = this.fileRepository.create({
            name: createFolderDto.name,
            originalName: createFolderDto.name,
            path: '',
            size: 0,
            mimeType: 'folder',
            type: createFolderDto.groupId ? file_type_enum_1.FileType.GROUP : file_type_enum_1.FileType.PERSONAL,
            uploaderId: userId,
            groupId: createFolderDto.groupId,
            parentId: createFolderDto.parentId,
            isFolder: true,
        });
        return this.fileRepository.save(folder);
    }
    async getFiles(getFilesDto, userId) {
        const { page = 1, limit = 20, type, parentId, groupId, search, foldersOnly } = getFilesDto;
        const queryBuilder = this.fileRepository
            .createQueryBuilder('file')
            .leftJoinAndSelect('file.uploader', 'uploader')
            .leftJoinAndSelect('file.group', 'group')
            .where('file.isDeleted = :isDeleted', { isDeleted: false });
        if (type) {
            queryBuilder.andWhere('file.type = :type', { type });
        }
        if (parentId !== undefined) {
            queryBuilder.andWhere('file.parentId = :parentId', { parentId });
        }
        else if (!search) {
            queryBuilder.andWhere('file.parentId IS NULL');
        }
        if (groupId) {
            await this.validateGroupMember(userId, groupId);
            queryBuilder.andWhere('file.groupId = :groupId', { groupId });
        }
        else {
            queryBuilder.andWhere('file.uploaderId = :userId', { userId });
        }
        if (search) {
            queryBuilder.andWhere('file.name ILIKE :search', { search: `%${search}%` });
        }
        if (foldersOnly) {
            queryBuilder.andWhere('file.isFolder = :isFolder', { isFolder: true });
        }
        const [files, total] = await queryBuilder
            .orderBy('file.isFolder', 'DESC')
            .addOrderBy('file.uploadedAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return { files, total, page, limit };
    }
    async getFileById(fileId, userId) {
        const file = await this.fileRepository.findOne({
            where: { id: fileId, isDeleted: false },
            relations: ['uploader', 'group', 'parent'],
        });
        if (!file) {
            throw new common_1.NotFoundException('File not found');
        }
        if (file.type === file_type_enum_1.FileType.PERSONAL && file.uploaderId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this file');
        }
        if (file.type === file_type_enum_1.FileType.GROUP && file.groupId) {
            await this.validateGroupMember(userId, file.groupId);
        }
        return file;
    }
    async deleteFile(fileId, userId) {
        const file = await this.getFileById(fileId, userId);
        if (file.uploaderId !== userId) {
            if (file.type === file_type_enum_1.FileType.GROUP && file.groupId) {
                const member = await this.groupMemberRepository.findOne({
                    where: { groupId: file.groupId, userId },
                });
                if ((member === null || member === void 0 ? void 0 : member.role) !== 'leader') {
                    throw new common_1.ForbiddenException('Only file owner or group leader can delete files');
                }
            }
            else {
                throw new common_1.ForbiddenException('You can only delete your own files');
            }
        }
        file.isDeleted = true;
        file.deletedAt = new Date();
        await this.fileRepository.save(file);
        await this.updateStorageUsage(file.uploaderId, file.type, file.groupId, -file.size);
        if (!file.isFolder && file.path) {
            try {
                fs.unlinkSync(file.path);
            }
            catch (error) {
                console.error('Error deleting physical file:', error);
            }
        }
    }
    async getStorageInfo(userId, type, groupId) {
        if (type === file_type_enum_1.FileType.PERSONAL) {
            let storage = await this.userStorageRepository.findOne({
                where: { userId },
            });
            if (!storage) {
                storage = this.userStorageRepository.create({
                    userId,
                    usedSpace: 0,
                    maxSpace: this.MAX_PERSONAL_SIZE,
                });
                await this.userStorageRepository.save(storage);
            }
            return {
                usedSpace: storage.usedSpace,
                maxSpace: storage.maxSpace,
                availableSpace: storage.availableSpace,
                usedPercentage: storage.usedPercentage,
            };
        }
        else {
            if (!groupId) {
                throw new common_1.BadRequestException('Group ID required for group storage');
            }
            await this.validateGroupMember(userId, groupId);
            let storage = await this.groupStorageRepository.findOne({
                where: { groupId },
            });
            if (!storage) {
                storage = this.groupStorageRepository.create({
                    groupId,
                    usedSpace: 0,
                    maxSpace: this.MAX_GROUP_SIZE,
                });
                await this.groupStorageRepository.save(storage);
            }
            return {
                usedSpace: storage.usedSpace,
                maxSpace: storage.maxSpace,
                availableSpace: storage.availableSpace,
                usedPercentage: storage.usedPercentage,
            };
        }
    }
    async validateGroupMember(userId, groupId) {
        const member = await this.groupMemberRepository.findOne({
            where: { userId, groupId },
        });
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
    }
    async validateParentFolder(parentId, userId, groupId) {
        const parent = await this.fileRepository.findOne({
            where: { id: parentId, isDeleted: false },
        });
        if (!parent) {
            throw new common_1.NotFoundException('Parent folder not found');
        }
        if (!parent.isFolder) {
            throw new common_1.BadRequestException('Parent must be a folder');
        }
        if (parent.type === file_type_enum_1.FileType.PERSONAL && parent.uploaderId !== userId) {
            throw new common_1.ForbiddenException('Cannot access this folder');
        }
        if (parent.type === file_type_enum_1.FileType.GROUP && parent.groupId !== groupId) {
            throw new common_1.BadRequestException('Parent folder belongs to different group');
        }
    }
    async checkStorageQuota(userId, type, groupId, fileSize) {
        if (type === file_type_enum_1.FileType.PERSONAL) {
            let storage = await this.userStorageRepository.findOne({
                where: { userId },
            });
            if (!storage) {
                storage = this.userStorageRepository.create({
                    userId,
                    usedSpace: 0,
                    maxSpace: this.MAX_PERSONAL_SIZE,
                });
                await this.userStorageRepository.save(storage);
            }
            const availableSpace = storage.maxSpace - storage.usedSpace;
            if (fileSize > availableSpace) {
                throw new common_1.BadRequestException(`Not enough storage space. Available: ${this.formatBytes(availableSpace)}`);
            }
        }
        else {
            if (!groupId) {
                throw new common_1.BadRequestException('Group ID required');
            }
            let storage = await this.groupStorageRepository.findOne({
                where: { groupId },
            });
            if (!storage) {
                storage = this.groupStorageRepository.create({
                    groupId,
                    usedSpace: 0,
                    maxSpace: this.MAX_GROUP_SIZE,
                });
                await this.groupStorageRepository.save(storage);
            }
            const availableSpace = storage.maxSpace - storage.usedSpace;
            if (fileSize > availableSpace) {
                throw new common_1.BadRequestException(`Not enough group storage space. Available: ${this.formatBytes(availableSpace)}`);
            }
        }
    }
    async updateStorageUsage(userId, type, groupId, sizeChange) {
        if (type === file_type_enum_1.FileType.PERSONAL) {
            await this.userStorageRepository
                .createQueryBuilder()
                .update()
                .set({ usedSpace: () => `"usedSpace" + ${sizeChange}` })
                .where('userId = :userId', { userId })
                .execute();
        }
        else if (groupId) {
            await this.groupStorageRepository
                .createQueryBuilder()
                .update()
                .set({ usedSpace: () => `"usedSpace" + ${sizeChange}` })
                .where('groupId = :groupId', { groupId })
                .execute();
        }
    }
    generateFileUrl(filename) {
        return `/uploads/${filename}`;
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
};
exports.FileService = FileService;
exports.FileService = FileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_entity_1.File)),
    __param(1, (0, typeorm_1.InjectRepository)(user_storage_entity_1.UserStorage)),
    __param(2, (0, typeorm_1.InjectRepository)(group_storage_entity_1.GroupStorage)),
    __param(3, (0, typeorm_1.InjectRepository)(group_member_entity_1.GroupMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FileService);
//# sourceMappingURL=file.service.js.map