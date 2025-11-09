"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const file_service_1 = require("./file.service");
const upload_file_dto_1 = require("./dto/upload-file.dto");
const create_folder_dto_1 = require("./dto/create-folder.dto");
const get_files_dto_1 = require("./dto/get-files.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt.auth.guard");
const file_type_enum_1 = require("../../common/enums/file-type.enum");
const getuser_decorator_1 = require("../../decorator/getuser.decorator");
let FileController = class FileController {
    constructor(fileService) {
        this.fileService = fileService;
    }
    async uploadFile(file, uploadDto, userId) {
        if (!file) {
            return {
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'No file uploaded',
            };
        }
        const uploadedFile = await this.fileService.uploadFile(file, uploadDto, userId);
        return {
            statusCode: common_1.HttpStatus.CREATED,
            message: 'File uploaded successfully',
            data: uploadedFile,
        };
    }
    async createFolder(createFolderDto, userId) {
        const folder = await this.fileService.createFolder(createFolderDto, userId);
        return {
            statusCode: common_1.HttpStatus.CREATED,
            message: 'Folder created successfully',
            data: folder,
        };
    }
    async getFiles(getFilesDto, userId) {
        const result = await this.fileService.getFiles(getFilesDto, userId);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Files retrieved successfully',
            data: result.files,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: Math.ceil(result.total / result.limit),
            },
        };
    }
    async getStorageInfo(type, groupId, userId) {
        const storage = await this.fileService.getStorageInfo(userId, type, groupId);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Storage info retrieved successfully',
            data: storage,
        };
    }
    async getFileById(id, userId) {
        const file = await this.fileService.getFileById(id, userId);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'File retrieved successfully',
            data: file,
        };
    }
    async downloadFile(id, userId, res) {
        const file = await this.fileService.getFileById(id, userId);
        if (file.isFolder) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                statusCode: common_1.HttpStatus.BAD_REQUEST,
                message: 'Cannot download a folder',
            });
        }
        if (!file.path) {
            return res.status(common_1.HttpStatus.NOT_FOUND).json({
                statusCode: common_1.HttpStatus.NOT_FOUND,
                message: 'File not found on server',
            });
        }
        res.download(file.path, file.originalName);
    }
    async deleteFile(id, userId) {
        await this.fileService.deleteFile(id, userId);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'File deleted successfully',
        };
    }
};
exports.FileController = FileController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a file' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                type: {
                    type: 'string',
                    enum: ['personal', 'group'],
                },
                groupId: {
                    type: 'number',
                },
                parentId: {
                    type: 'number',
                },
                customName: {
                    type: 'string',
                },
            },
            required: ['file', 'type'],
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, getuser_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_file_dto_1.UploadFileDto, String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('folders'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new folder' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, getuser_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_folder_dto_1.CreateFolderDto, String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "createFolder", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get list of files and folders' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, getuser_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_files_dto_1.GetFilesDto, String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getFiles", null);
__decorate([
    (0, common_1.Get)('storage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get storage information' }),
    (0, swagger_1.ApiQuery)({
        name: 'type',
        enum: file_type_enum_1.FileType,
        required: true,
        description: 'Loại storage: "personal" (cá nhân) hoặc "group" (nhóm)',
        example: file_type_enum_1.FileType.PERSONAL,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'groupId',
        required: false,
        description: 'ID của nhóm (BẮT BUỘC nếu type="group", bỏ trống nếu type="personal")',
        example: null,
        type: Number,
    }),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('groupId', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, getuser_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getStorageInfo", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get file details by ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, getuser_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "getFileById", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Download a file' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, getuser_decorator_1.GetUser)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a file or folder' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, getuser_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], FileController.prototype, "deleteFile", null);
exports.FileController = FileController = __decorate([
    (0, swagger_1.ApiTags)('Files'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [file_service_1.FileService])
], FileController);
//# sourceMappingURL=file.controller.js.map