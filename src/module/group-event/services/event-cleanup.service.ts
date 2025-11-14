import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GroupEventService } from './group-event.service';

@Injectable()
export class EventCleanupService {
  private readonly logger = new Logger(EventCleanupService.name);

  constructor(private readonly groupEventService: GroupEventService) {}

  /**
   * Tự động xóa các events đã qua giờ kết thúc
   * Chạy mỗi 1 giờ
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredEvents() {
    try {
      this.logger.log('Starting expired events cleanup...');
      
      const deletedCount = await this.groupEventService.deleteExpiredEvents();
      
      if (deletedCount > 0) {
        this.logger.log(`✅ Cleaned up ${deletedCount} expired events`);
      } else {
        this.logger.log('No expired events to clean up');
      }
    } catch (error) {
      this.logger.error('Failed to cleanup expired events:', error);
    }
  }
}
