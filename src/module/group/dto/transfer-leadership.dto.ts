import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TransferLeadershipDto {
  @ApiProperty({
    description: 'ID of the member to transfer leadership to (UUID)',
    example: "cuong-uuid-string-here"
  })
  @IsNotEmpty()
  @IsString()
  newLeaderId: string;
}