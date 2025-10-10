import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { File } from './entities/file.entity';
import { UserStorage } from './entities/user-storage.entity';
import { GroupStorage } from './entities/group-storage.entity';
import { GroupMember } from '../group/entities/group-member.entity';
import { FileType } from '../../common/enums/file-type.enum';
import { UploadFileDto } from './dto/upload-file.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { GetFilesDto } from './dto/get-files.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(UserStorage)
    private userStorageRepository: Repository<UserStorage>,
    @InjectRepository(GroupStorage)
    private groupStorageRepository: Repository<GroupStorage>,
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
  ) {}

  // Constants
  private readonly MAX_PERSONAL_SIZE = 104857600; // 100MB
  private readonly MAX_GROUP_SIZE = 1073741824; // 1GB
  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads');

  async uploadFile(
    file: Express.Multer.File,
    uploadDto: UploadFileDto,
    userId: string,
  ): Promise<File> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type and group membership
    if (uploadDto.type === FileType.GROUP) {
      if (!uploadDto.groupId) {
        throw new BadRequestException('Group ID is required for group files');
      }
      await this.validateGroupMember(userId, uploadDto.groupId);
    }

    // Check file size limits
    const maxSize = uploadDto.type === FileType.PERSONAL 
      ? this.MAX_PERSONAL_SIZE 
      : this.MAX_GROUP_SIZE;
    
    if (file.size > maxSize) {
      const limit = uploadDto.type === FileType.PERSONAL ? '100MB' : '1GB';
      throw new BadRequestException(
        `File size exceeds ${limit} limit for ${uploadDto.type} files`,
      );
    }

    // Check storage quota
    await this.checkStorageQuota(userId, uploadDto.type, uploadDto.groupId, file.size);

    // Validate parent folder if provided
    if (uploadDto.parentId) {
      await this.validateParentFolder(uploadDto.parentId, userId, uploadDto.groupId);
    }

    // Create file record
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

    // Update storage usage
    await this.updateStorageUsage(userId, uploadDto.type, uploadDto.groupId, file.size);

    return savedFile;
  }

  async createFolder(
    createFolderDto: CreateFolderDto,
    userId: string,
  ): Promise<File> {
    // Validate group membership if creating group folder
    if (createFolderDto.groupId) {
      await this.validateGroupMember(userId, createFolderDto.groupId);
    }

    // Validate parent folder
    if (createFolderDto.parentId) {
      await this.validateParentFolder(
        createFolderDto.parentId,
        userId,
        createFolderDto.groupId,
      );
    }

    const folder = this.fileRepository.create({
      name: createFolderDto.name,
      originalName: createFolderDto.name,
      path: '',
      size: 0,
      mimeType: 'folder',
      type: createFolderDto.groupId ? FileType.GROUP : FileType.PERSONAL,
      uploaderId: userId,
      groupId: createFolderDto.groupId,
      parentId: createFolderDto.parentId,
      isFolder: true,
    });

    return this.fileRepository.save(folder);
  }

  async getFiles(
    getFilesDto: GetFilesDto,
    userId: string,
  ): Promise<{ files: File[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, type, parentId, groupId, search, foldersOnly } = getFilesDto;

    const queryBuilder = this.fileRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.uploader', 'uploader')
      .leftJoinAndSelect('file.group', 'group')
      .where('file.isDeleted = :isDeleted', { isDeleted: false });

    // Filter by type
    if (type) {
      queryBuilder.andWhere('file.type = :type', { type });
    }

    // Filter by parent (folder structure)
    if (parentId !== undefined) {
      queryBuilder.andWhere('file.parentId = :parentId', { parentId });
    } else if (!search) {
      // If no parent specified and not searching, show root files only
      queryBuilder.andWhere('file.parentId IS NULL');
    }

    // Filter by group
    if (groupId) {
      await this.validateGroupMember(userId, groupId);
      queryBuilder.andWhere('file.groupId = :groupId', { groupId });
    } else {
      // Personal files
      queryBuilder.andWhere('file.uploaderId = :userId', { userId });
    }

    // Search by name
    if (search) {
      queryBuilder.andWhere('file.name ILIKE :search', { search: `%${search}%` });
    }

    // Filter folders only
    if (foldersOnly) {
      queryBuilder.andWhere('file.isFolder = :isFolder', { isFolder: true });
    }

    // Pagination
    const [files, total] = await queryBuilder
      .orderBy('file.isFolder', 'DESC') // Folders first
      .addOrderBy('file.uploadedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { files, total, page, limit };
  }

  async getFileById(fileId: number, userId: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id: fileId, isDeleted: false },
      relations: ['uploader', 'group', 'parent'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Check permissions
    if (file.type === FileType.PERSONAL && file.uploaderId !== userId) {
      throw new ForbiddenException('You do not have access to this file');
    }

    if (file.type === FileType.GROUP && file.groupId) {
      await this.validateGroupMember(userId, file.groupId);
    }

    return file;
  }

  async deleteFile(fileId: number, userId: string): Promise<void> {
    const file = await this.getFileById(fileId, userId);

    // Check if user is owner (or group leader if group file)
    if (file.uploaderId !== userId) {
      if (file.type === FileType.GROUP && file.groupId) {
        const member = await this.groupMemberRepository.findOne({
          where: { groupId: file.groupId, userId },
        });

        if (member?.role !== 'leader') {
          throw new ForbiddenException('Only file owner or group leader can delete files');
        }
      } else {
        throw new ForbiddenException('You can only delete your own files');
      }
    }

    // Soft delete
    file.isDeleted = true;
    file.deletedAt = new Date();
    await this.fileRepository.save(file);

    // Update storage usage
    await this.updateStorageUsage(
      file.uploaderId,
      file.type,
      file.groupId,
      -file.size,
    );

    // Delete physical file if not a folder
    if (!file.isFolder && file.path) {
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error('Error deleting physical file:', error);
      }
    }
  }

  async getStorageInfo(userId: string, type: FileType, groupId?: number) {
    if (type === FileType.PERSONAL) {
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
    } else {
      if (!groupId) {
        throw new BadRequestException('Group ID required for group storage');
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

  // Helper methods
  private async validateGroupMember(userId: string, groupId: number): Promise<void> {
    const member = await this.groupMemberRepository.findOne({
      where: { userId, groupId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }
  }

  private async validateParentFolder(
    parentId: number,
    userId: string,
    groupId?: number,
  ): Promise<void> {
    const parent = await this.fileRepository.findOne({
      where: { id: parentId, isDeleted: false },
    });

    if (!parent) {
      throw new NotFoundException('Parent folder not found');
    }

    if (!parent.isFolder) {
      throw new BadRequestException('Parent must be a folder');
    }

    if (parent.type === FileType.PERSONAL && parent.uploaderId !== userId) {
      throw new ForbiddenException('Cannot access this folder');
    }

    if (parent.type === FileType.GROUP && parent.groupId !== groupId) {
      throw new BadRequestException('Parent folder belongs to different group');
    }
  }

  private async checkStorageQuota(
    userId: string,
    type: FileType,
    groupId: number | undefined,
    fileSize: number,
  ): Promise<void> {
    if (type === FileType.PERSONAL) {
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

      if (storage.usedSpace + fileSize > storage.maxSpace) {
        throw new BadRequestException(
          `Not enough storage space. Available: ${this.formatBytes(storage.availableSpace)}`,
        );
      }
    } else {
      if (!groupId) {
        throw new BadRequestException('Group ID required');
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

      if (storage.usedSpace + fileSize > storage.maxSpace) {
        throw new BadRequestException(
          `Not enough group storage space. Available: ${this.formatBytes(storage.availableSpace)}`,
        );
      }
    }
  }

  private async updateStorageUsage(
    userId: string,
    type: FileType,
    groupId: number | undefined,
    sizeChange: number,
  ): Promise<void> {
    if (type === FileType.PERSONAL) {
      await this.userStorageRepository
        .createQueryBuilder()
        .update()
        .set({ usedSpace: () => `"usedSpace" + ${sizeChange}` })
        .where('userId = :userId', { userId })
        .execute();
    } else if (groupId) {
      await this.groupStorageRepository
        .createQueryBuilder()
        .update()
        .set({ usedSpace: () => `"usedSpace" + ${sizeChange}` })
        .where('groupId = :groupId', { groupId })
        .execute();
    }
  }

  private generateFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
