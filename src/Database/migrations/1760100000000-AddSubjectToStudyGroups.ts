import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSubjectToStudyGroups1760100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'study_groups',
      new TableColumn({
        name: 'subject',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('study_groups', 'subject');
  }
}
