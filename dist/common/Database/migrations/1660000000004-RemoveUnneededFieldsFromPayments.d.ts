import { MigrationInterface, QueryRunner } from "typeorm";
export declare class RemoveUnneededFieldsFromPayments1660000000004 implements MigrationInterface {
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
