import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../entities/message.entity';

class AttachmentDto {
  @ApiProperty({ description: 'Tên file', example: 'document.pdf' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'URL file', example: 'https://storage.example.com/file.pdf' })
  @IsString()
  url: string;

  @ApiProperty({ description: 'Kích thước file (bytes)', example: 1024000 })
  @IsNumber()
  size: number;

  @ApiProperty({ description: 'MIME type', example: 'application/pdf' })
  @IsString()
  mimeType: string;
}

export class CreateMessageDto {
  @ApiProperty({
    description: 'Nội dung tin nhắn',
    example: 'Hello everyone! Let\'s start our study session.',
    maxLength: 5000
  })
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  @IsString()
  @MaxLength(5000, { message: 'Nội dung tin nhắn không được quá 5000 ký tự' })
  content: string;

  @ApiProperty({
    description: 'Loại tin nhắn',
    enum: MessageType,
    default: MessageType.TEXT,
    required: false
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({
    description: 'Danh sách file đính kèm',
    type: [AttachmentDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @ApiProperty({
    description: 'ID tin nhắn được reply',
    example: 123,
    required: false
  })
  @IsOptional()
  @IsNumber()
  replyToId?: number;
}
