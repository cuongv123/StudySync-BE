import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { UserStorage } from './entities/user-storage.entity';
import { GroupStorage } from './entities/group-storage.entity';
import { GroupMember } from '../group/entities/group-member.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';
import { FileType } from '../../common/enums/file-type.enum';
import { UploadFileDto } from './dto/upload-file.dto';
import { CreateFolderDto } from './dto/create-folder.dto';
import { GetFilesDto } from './dto/get-files.dto';
export declare class FileService {
    private fileRepository;
    private userStorageRepository;
    private groupStorageRepository;
    private groupMemberRepository;
    private userSubscriptionRepository;
    private subscriptionPlanRepository;
    constructor(fileRepository: Repository<File>, userStorageRepository: Repository<UserStorage>, groupStorageRepository: Repository<GroupStorage>, groupMemberRepository: Repository<GroupMember>, userSubscriptionRepository: Repository<UserSubscription>, subscriptionPlanRepository: Repository<SubscriptionPlan>);
    private readonly MAX_GROUP_SIZE;
    private readonly UPLOAD_DIR;
    private getUserStorageLimit;
    uploadFile(file: Express.Multer.File, uploadDto: UploadFileDto, userId: string): Promise<File>;
    createFolder(createFolderDto: CreateFolderDto, userId: string): Promise<File>;
    getFiles(getFilesDto: GetFilesDto, userId: string): Promise<{
        files: File[];
        total: number;
        page: number;
        limit: number;
    }>;
    getFileById(fileId: number, userId: string): Promise<File>;
    deleteFile(fileId: number, userId: string): Promise<void>;
    getStorageInfo(userId: string, type: FileType, groupId?: number): Promise<{
        usedSpace: number;
        maxSpace: number;
        availableSpace: number;
        usedPercentage: number;
        planName: string;
        storageLimitMB: number;
    } | {
        usedSpace: number;
        maxSpace: number;
        availableSpace: number;
        usedPercentage: number;
        planName?: undefined;
        storageLimitMB?: undefined;
    }>;
    private validateGroupMember;
    private validateParentFolder;
    private checkStorageQuota;
    private updateStorageUsage;
    private generateFileUrl;
    private formatBytes;
}
