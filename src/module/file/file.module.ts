import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { File } from './entities/file.entity';
import { UserStorage } from './entities/user-storage.entity';
import { GroupStorage } from './entities/group-storage.entity';
import { GroupMember } from '../group/entities/group-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, UserStorage, GroupStorage, GroupMember]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 1073741824, // 1GB max (will be checked in service for personal vs group)
      },
    }),
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
