import { User } from '../../User/entities/User.entity';
import { StudyGroup } from '../../group/entities/group.entity';
import { FileType } from '../../../common/enums/file-type.enum';
export declare class File {
    id: number;
    name: string;
    originalName: string;
    path: string;
    url?: string;
    size: number;
    mimeType: string;
    type: FileType;
    uploaderId: string;
    uploader: User;
    groupId?: number;
    group?: StudyGroup;
    parentId?: number;
    parent?: File;
    children?: File[];
    isFolder: boolean;
    isDeleted: boolean;
    deletedAt?: Date;
    uploadedAt: Date;
    updatedAt: Date;
}
