import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveHistoryDto {
  @ApiProperty({ 
    description: 'Conversation ID (optional for first message, required for subsequent messages)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiProperty({ 
    description: 'User query text',
    example: 'Giải thích cho tôi về React hooks' 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  query: string;

  @ApiProperty({ 
    description: 'AI response text',
    example: 'React hooks là các hàm đặc biệt cho phép bạn...' 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50000)
  response: string;
}
