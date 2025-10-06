import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../../../common/enums/task-status.enum';

export class UpdateTaskStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới của task',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;
}
