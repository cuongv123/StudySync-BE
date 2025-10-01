import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserFields1759321587479 implements MigrationInterface {
    name = 'AddUserFields1759321587479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "phoneNumber" character varying(15)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "studentId" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_42dc3c1fa59ce4a36a19cff2721" UNIQUE ("studentId")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "major" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "major"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_42dc3c1fa59ce4a36a19cff2721"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "studentId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phoneNumber"`);
    }

}