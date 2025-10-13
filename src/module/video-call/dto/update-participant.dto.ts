import { IsInt, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateParticipantDto {
  @ApiProperty({ example: 1, description: 'ID của participant' })
  @IsInt()
  participantId: number;

  @ApiPropertyOptional({ example: true, description: 'Tắt/bật mic' })
  @IsOptional()
  @IsBoolean()
  isMuted?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Tắt/bật camera' })
  @IsOptional()
  @IsBoolean()
  isVideoOff?: boolean;
}
