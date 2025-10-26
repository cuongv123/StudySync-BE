import { FileType } from '../../../common/enums/file-type.enum';
export declare class GetFilesDto {
    page?: number;
    limit?: number;
    type?: FileType;
    parentId?: number;
    groupId?: number;
    search?: string;
    foldersOnly?: boolean;
}
