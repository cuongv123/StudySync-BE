import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveHistoryDto {
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
