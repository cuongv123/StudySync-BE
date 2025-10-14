import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaymentMethodEnumToSepayOnly1697265600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE payments ALTER COLUMN payment_method DROP DEFAULT;
            ALTER TYPE payment_method RENAME TO payment_method_old;
            CREATE TYPE payment_method AS ENUM ('sepay');
            ALTER TABLE payments ALTER COLUMN payment_method TYPE payment_method USING payment_method::text::payment_method;
            DROP TYPE payment_method_old;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE payments ALTER COLUMN payment_method DROP DEFAULT;
            ALTER TYPE payment_method RENAME TO payment_method_old;
            CREATE TYPE payment_method AS ENUM ('vnpay', 'momo', 'zalopay');
            ALTER TABLE payments ALTER COLUMN payment_method TYPE payment_method USING payment_method::text::payment_method;
            DROP TYPE payment_method_old;
        `);
    }
}
