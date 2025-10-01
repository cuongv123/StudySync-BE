import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTokenOTP1759244556062 implements MigrationInterface {
    name = 'UpdateUserTokenOTP1759244556062'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tokenOTP"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "tokenOTP" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tokenOTP"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "tokenOTP" character varying`);
    }

}
