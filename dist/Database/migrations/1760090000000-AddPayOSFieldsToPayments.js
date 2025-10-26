"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPayOSFieldsToPayments1760090000000 = void 0;
const typeorm_1 = require("typeorm");
class AddPayOSFieldsToPayments1760090000000 {
    async up(queryRunner) {
        await queryRunner.addColumn('payments', new typeorm_1.TableColumn({
            name: 'planId',
            type: 'integer',
            isNullable: true,
        }));
        await queryRunner.addColumn('payments', new typeorm_1.TableColumn({
            name: 'checkoutUrl',
            type: 'text',
            isNullable: true,
        }));
        await queryRunner.query(`
      ALTER TABLE "payments" 
      ADD CONSTRAINT "FK_payments_planId" 
      FOREIGN KEY ("planId") 
      REFERENCES "subscription_plans"("id") 
      ON DELETE SET NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "payments" 
      DROP CONSTRAINT IF EXISTS "FK_payments_planId"
    `);
        await queryRunner.dropColumn('payments', 'checkoutUrl');
        await queryRunner.dropColumn('payments', 'planId');
    }
}
exports.AddPayOSFieldsToPayments1760090000000 = AddPayOSFieldsToPayments1760090000000;
//# sourceMappingURL=1760090000000-AddPayOSFieldsToPayments.js.map