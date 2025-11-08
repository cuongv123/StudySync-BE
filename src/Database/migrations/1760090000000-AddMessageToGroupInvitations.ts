import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddMessageToGroupInvitations1760090000000 implements MigrationInterface {
    name = 'AddMessageToGroupInvitations1760090000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('group_invitations', new TableColumn({
            name: 'message',
            type: 'text',
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('group_invitations', 'message');
    }
}
