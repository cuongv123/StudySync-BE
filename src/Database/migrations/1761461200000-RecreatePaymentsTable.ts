import { MigrationInterface, QueryRunner } from "typeorm";

export class RecreatePaymentsTable1761461200000 implements MigrationInterface {
    name = 'RecreatePaymentsTable1761461200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop old table if exists
        await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);

        // Create enum for payment_status
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "payment_status" AS ENUM ('pending', 'paid', 'cancelled', 'expired');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create payments table
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

        // Create indexes
        await queryRunner.query(`CREATE INDEX "IDX_payments_userId" ON "payments"("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_payments_transactionId" ON "payments"("transactionId")`);
        await queryRunner.query(`CREATE INDEX "IDX_payments_status" ON "payments"("paymentStatus")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);
        await queryRunner.query(`DROP TYPE IF EXISTS "payment_status"`);
    }
}
