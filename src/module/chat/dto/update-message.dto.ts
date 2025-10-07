import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'Nội dung tin nhắn mới',
    example: 'Updated message content',
    maxLength: 5000
  })
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  @IsString()
  @MaxLength(5000, { message: 'Nội dung tin nhắn không được quá 5000 ký tự' })
  content: string;
}
