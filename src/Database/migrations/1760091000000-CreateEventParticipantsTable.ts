import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateEventParticipantsTable1760091000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'event_participants',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'eventId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key to group_events table
    await queryRunner.createForeignKey(
      'event_participants',
      new TableForeignKey({
        columnNames: ['eventId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'group_events',
        onDelete: 'CASCADE',
        name: 'FK_event_participants_group_events',
      }),
    );

    // Add foreign key to users table
    await queryRunner.createForeignKey(
      'event_participants',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_event_participants_users',
      }),
    );

    // Create unique constraint to prevent duplicate participant entries
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_event_participants_unique" ON "event_participants" ("eventId", "userId");
    `);

    // Create index on eventId for faster queries
    await queryRunner.query(`
      CREATE INDEX "IDX_event_participants_eventId" ON "event_participants" ("eventId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_event_participants_eventId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_event_participants_unique"`);

    // Drop foreign keys
    await queryRunner.dropForeignKey('event_participants', 'FK_event_participants_users');
    await queryRunner.dropForeignKey('event_participants', 'FK_event_participants_group_events');

    // Drop table
    await queryRunner.dropTable('event_participants');
  }
}
