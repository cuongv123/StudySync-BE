import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinCallDto {
  @ApiProperty({ example: 1, description: 'ID của cuộc gọi' })
  @IsInt()
  callId: number;

  @ApiProperty({ example: 'peer-abc-123', description: 'WebRTC Peer ID' })
  @IsString()
  peerId: string;
}
