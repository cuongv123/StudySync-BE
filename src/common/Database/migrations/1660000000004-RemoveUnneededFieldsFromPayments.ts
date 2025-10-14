import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUnneededFieldsFromPayments1660000000004 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "paymentUrl"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "callbackData"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "ipAddress"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN "paymentUrl" text`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN "callbackData" jsonb`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN "expiresAt" timestamp`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN "ipAddress" inet`);
    }
}
