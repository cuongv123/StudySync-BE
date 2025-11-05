import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminReplyDto {
  @ApiProperty({
    example: 'Cảm ơn bạn rất nhiều! Chúng tôi sẽ cải thiện tốt hơn.',
    description: 'Admin reply to review',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  adminReply: string;
}
