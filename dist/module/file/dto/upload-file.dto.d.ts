import { FileType } from '../../../common/enums/file-type.enum';
export declare class UploadFileDto {
    type: FileType;
    groupId?: number;
    parentId?: number;
    customName?: string;
}
