import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { FileService } from './file.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { GetFilesDto } from './dto/get-files.dto';
import { FileType } from '../../common/enums/file-type.enum';
export declare class FileController {
    private readonly fileService;
    constructor(fileService: FileService);
    uploadFile(file: Express.Multer.File, uploadDto: UploadFileDto, userId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/file.entity").File;
    }>;
    createFolder(createFolderDto: CreateFolderDto, userId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/file.entity").File;
    }>;
    getFiles(getFilesDto: GetFilesDto, userId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/file.entity").File[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStorageInfo(type: FileType, groupId: number, userId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            usedSpace: number;
            maxSpace: number;
            availableSpace: number;
            usedPercentage: number;
        };
    }>;
    getFileById(id: number, userId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/file.entity").File;
    }>;
    downloadFile(id: number, userId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteFile(id: number, userId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
}
