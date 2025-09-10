import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1757406107045 implements MigrationInterface {
    name = 'CreateUsersTable1757406107045'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "username" character varying, "roleId" integer NOT NULL, "isVerified" boolean NOT NULL DEFAULT false, "tokenOTP" character varying, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
