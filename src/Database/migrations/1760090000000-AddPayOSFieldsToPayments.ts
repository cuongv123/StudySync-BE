import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPayOSFieldsToPayments1760090000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add planId column for subscription payments
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'planId',
        type: 'integer',
        isNullable: true,
      }),
    );

    // Add checkoutUrl column for PayOS payment links
    await queryRunner.addColumn(
      'payments',
      new TableColumn({
        name: 'checkoutUrl',
        type: 'text',
        isNullable: true,
      }),
    );

    // Add foreign key constraint for planId
    await queryRunner.query(`
      ALTER TABLE "payments" 
      ADD CONSTRAINT "FK_payments_planId" 
      FOREIGN KEY ("planId") 
      REFERENCES "subscription_plans"("id") 
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "payments" 
      DROP CONSTRAINT IF EXISTS "FK_payments_planId"
    `);

    // Drop columns
    await queryRunner.dropColumn('payments', 'checkoutUrl');
    await queryRunner.dropColumn('payments', 'planId');
  }
}
