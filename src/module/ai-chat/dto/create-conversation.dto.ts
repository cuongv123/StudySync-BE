import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ 
    description: 'Title for the conversation (optional, will be auto-generated from first message)',
    example: 'Hỏi về React Hooks',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;
}
