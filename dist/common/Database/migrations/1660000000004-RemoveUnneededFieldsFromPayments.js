"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveUnneededFieldsFromPayments1660000000004 = void 0;
class RemoveUnneededFieldsFromPayments1660000000004 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "paymentUrl"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "callbackData"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "ipAddress"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN "paymentUrl" text`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN "callbackData" jsonb`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN "expiresAt" timestamp`);
        await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN "ipAddress" inet`);
    }
}
exports.RemoveUnneededFieldsFromPayments1660000000004 = RemoveUnneededFieldsFromPayments1660000000004;
//# sourceMappingURL=1660000000004-RemoveUnneededFieldsFromPayments.js.map