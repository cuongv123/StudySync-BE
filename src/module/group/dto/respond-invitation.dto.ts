import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { InvitationStatus } from '../entities/group-invitation.entity';

export class RespondInvitationDto {
  @ApiProperty({
    description: 'Phản hồi lời mời',
    example: 'accepted',
    enum: InvitationStatus,
  })
  @IsNotEmpty()
  @IsEnum(InvitationStatus, { message: 'Trạng thái phản hồi không hợp lệ' })
  status: InvitationStatus;
}