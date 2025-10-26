import { MessageType } from '../entities/message.entity';
declare class AttachmentDto {
    filename: string;
    url: string;
    size: number;
    mimeType: string;
}
export declare class CreateMessageDto {
    content: string;
    type?: MessageType;
    attachments?: AttachmentDto[];
    replyToId?: number;
}
export {};
