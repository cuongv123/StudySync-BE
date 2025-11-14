import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateGroupEventsTable1760090000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'group_events',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'groupId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'creatorId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'eventType',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'eventDate',
            type: 'timestamp with time zone',
            isNullable: false,
          },
          {
            name: 'endDate',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'reminderMinutes',
            type: 'integer',
            isNullable: true,
            comment: 'Number of minutes before event to send reminder (e.g., 15, 30, 60)',
          },
          {
            name: 'isAllDay',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key to study_groups table
    await queryRunner.createForeignKey(
      'group_events',
      new TableForeignKey({
        columnNames: ['groupId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'study_groups',
        onDelete: 'CASCADE',
        name: 'FK_group_events_study_groups',
      }),
    );

    // Add foreign key to users table
    await queryRunner.createForeignKey(
      'group_events',
      new TableForeignKey({
        columnNames: ['creatorId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        name: 'FK_group_events_users',
      }),
    );

    // Create index on groupId for faster queries
    await queryRunner.query(`
      CREATE INDEX "IDX_group_events_groupId" ON "group_events" ("groupId");
    `);

    // Create index on eventDate for date range queries
    await queryRunner.query(`
      CREATE INDEX "IDX_group_events_eventDate" ON "group_events" ("eventDate");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_group_events_eventDate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_group_events_groupId"`);

    // Drop foreign keys
    await queryRunner.dropForeignKey('group_events', 'FK_group_events_users');
    await queryRunner.dropForeignKey('group_events', 'FK_group_events_study_groups');

    // Drop table
    await queryRunner.dropTable('group_events');
  }
}
