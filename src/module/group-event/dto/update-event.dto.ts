import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(
  OmitType(CreateEventDto, ['groupId'] as const),
) {
  // Không cần groupId khi update vì event đã thuộc về 1 group cố định
}
