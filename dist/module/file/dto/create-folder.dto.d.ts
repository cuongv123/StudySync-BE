import { FileType } from '../../../common/enums/file-type.enum';
export declare class CreateFolderDto {
    name: string;
    type: FileType;
    parentId?: number;
    groupId?: number;
}
