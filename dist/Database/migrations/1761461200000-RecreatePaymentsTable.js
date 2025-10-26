"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecreatePaymentsTable1761461200000 = void 0;
class RecreatePaymentsTable1761461200000 {
    constructor() {
        this.name = 'RecreatePaymentsTable1761461200000';
    }
    async up(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "payment_status" AS ENUM ('pending', 'paid', 'cancelled', 'expired');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        await queryRunner.query(`
            CREATE TABLE "payments" (
                "id" BIGSERIAL PRIMARY KEY,
                "userId" uuid NOT NULL,
                "planId" integer,
                "transactionId" varchar NOT NULL UNIQUE,
                "amount" numeric NOT NULL,
                "paymentStatus" payment_status NOT NULL DEFAULT 'pending',
                "paymentMethod" varchar NOT NULL DEFAULT 'PAYOS',
                "checkoutUrl" text,
                "gatewayResponse" text,
                "paymentDate" timestamp,
                "expiresAt" timestamp,
                "walletId" integer,
                "callbackData" jsonb,
                "createdAt" timestamp NOT NULL DEFAULT now(),
                "updatedAt" timestamp NOT NULL DEFAULT now(),
                CONSTRAINT "FK_payments_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_payments_planId" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE SET NULL
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_payments_userId" ON "payments"("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_payments_transactionId" ON "payments"("transactionId")`);
        await queryRunner.query(`CREATE INDEX "IDX_payments_status" ON "payments"("paymentStatus")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);
        await queryRunner.query(`DROP TYPE IF EXISTS "payment_status"`);
    }
}
exports.RecreatePaymentsTable1761461200000 = RecreatePaymentsTable1761461200000;
//# sourceMappingURL=1761461200000-RecreatePaymentsTable.js.map