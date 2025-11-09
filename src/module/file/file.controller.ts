import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Res,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { FileService } from './file.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { GetFilesDto } from './dto/get-files.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { FileType } from '../../common/enums/file-type.enum';
import { GetUser } from '../../decorator/getuser.decorator';

@ApiTags('Files')
@ApiBearerAuth('JWT-auth')
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
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
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
    @GetUser('id') userId: string,
  ) {
    if (!file) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No file uploaded',
      };
    }

    const uploadedFile = await this.fileService.uploadFile(file, uploadDto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'File uploaded successfully',
      data: uploadedFile,
    };
  }

  @Post('folders')
  @ApiOperation({ summary: 'Create a new folder' })
  async createFolder(
    @Body() createFolderDto: CreateFolderDto,
    @GetUser('id') userId: string,
  ) {
    const folder = await this.fileService.createFolder(createFolderDto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Folder created successfully',
      data: folder,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get list of files and folders' })
  async getFiles(
    @Query() getFilesDto: GetFilesDto,
    @GetUser('id') userId: string,
  ) {
    const result = await this.fileService.getFiles(getFilesDto, userId);
    return {
      statusCode: HttpStatus.OK,
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

  @Get('storage')
  @ApiOperation({ summary: 'Get storage information' })
  @ApiQuery({ 
    name: 'type', 
    enum: FileType,
    required: true,
    description: 'Loại storage: "personal" (cá nhân) hoặc "group" (nhóm)',
    example: FileType.PERSONAL,
  })
  @ApiQuery({ 
    name: 'groupId', 
    required: false,
    description: 'ID của nhóm (BẮT BUỘC nếu type="group", bỏ trống nếu type="personal")',
    example: null,
    type: Number,
  })
  async getStorageInfo(
    @Query('type') type: FileType,
    @Query('groupId', new ParseIntPipe({ optional: true })) groupId: number,
    @GetUser('id') userId: string,
  ) {
    const storage = await this.fileService.getStorageInfo(userId, type, groupId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Storage info retrieved successfully',
      data: storage,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file details by ID' })
  async getFileById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: string,
  ) {
    const file = await this.fileService.getFileById(id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'File retrieved successfully',
      data: file,
    };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a file' })
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: string,
    @Res() res: Response,
  ) {
    const file = await this.fileService.getFileById(id, userId);

    if (file.isFolder) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cannot download a folder',
      });
    }

    if (!file.path) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'File not found on server',
      });
    }

    res.download(file.path, file.originalName);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file or folder' })
  async deleteFile(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: string,
  ) {
    await this.fileService.deleteFile(id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'File deleted successfully',
    };
  }
}
