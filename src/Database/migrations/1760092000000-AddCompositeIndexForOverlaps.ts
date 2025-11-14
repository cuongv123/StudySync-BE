import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompositeIndexForOverlaps1760092000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm composite index để optimize OVERLAPS query khi scale lớn
    // Index này giúp query nhanh hơn khi check xung đột thời gian
    await queryRunner.query(`
      CREATE INDEX "IDX_group_events_overlap" 
      ON "group_events" ("groupId", "eventDate", "endDate");
    `);

    // Thêm index cho userId trong event_participants để query "events của user X" nhanh hơn
    await queryRunner.query(`
      CREATE INDEX "IDX_event_participants_userId" 
      ON "event_participants" ("userId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_event_participants_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_group_events_overlap"`);
  }
}
