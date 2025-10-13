import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileManagement1760077500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create file_type enum
    await queryRunner.query(`
      CREATE TYPE "files_type_enum" AS ENUM('personal', 'group')
    `);

    // Create files table
    await queryRunner.query(`
      CREATE TABLE "files" (
        "id" SERIAL NOT NULL,
        "name" character varying(255) NOT NULL,
        "originalName" character varying(255) NOT NULL,
        "path" text NOT NULL DEFAULT '',
        "url" text,
        "size" bigint NOT NULL DEFAULT 0,
        "mimeType" character varying(100) NOT NULL,
        "type" "files_type_enum" NOT NULL DEFAULT 'personal',
        "uploaderId" uuid NOT NULL,
        "groupId" integer,
        "parentId" integer,
        "isFolder" boolean NOT NULL DEFAULT false,
        "isDeleted" boolean NOT NULL DEFAULT false,
        "deletedAt" TIMESTAMP,
        "uploadedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_files" PRIMARY KEY ("id")
      )
    `);

    // Create user_storage table
    await queryRunner.query(`
      CREATE TABLE "user_storage" (
        "id" SERIAL NOT NULL,
        "userId" uuid NOT NULL,
        "usedSpace" bigint NOT NULL DEFAULT 0,
        "maxSpace" bigint NOT NULL DEFAULT 104857600,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_storage" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_storage_userId" UNIQUE ("userId")
      )
    `);

    // Create group_storage table
    await queryRunner.query(`
      CREATE TABLE "group_storage" (
        "id" SERIAL NOT NULL,
        "groupId" integer NOT NULL,
        "usedSpace" bigint NOT NULL DEFAULT 0,
        "maxSpace" bigint NOT NULL DEFAULT 1073741824,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_group_storage" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_group_storage_groupId" UNIQUE ("groupId")
      )
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "files"
      ADD CONSTRAINT "FK_files_uploader"
      FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "files"
      ADD CONSTRAINT "FK_files_group"
      FOREIGN KEY ("groupId") REFERENCES "study_groups"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "files"
      ADD CONSTRAINT "FK_files_parent"
      FOREIGN KEY ("parentId") REFERENCES "files"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "user_storage"
      ADD CONSTRAINT "FK_user_storage_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "group_storage"
      ADD CONSTRAINT "FK_group_storage_group"
      FOREIGN KEY ("groupId") REFERENCES "study_groups"("id") ON DELETE CASCADE
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_files_uploader" ON "files" ("uploaderId")`);
    await queryRunner.query(`CREATE INDEX "IDX_files_group" ON "files" ("groupId")`);
    await queryRunner.query(`CREATE INDEX "IDX_files_parent" ON "files" ("parentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_files_type" ON "files" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_files_isFolder" ON "files" ("isFolder")`);
    await queryRunner.query(`CREATE INDEX "IDX_files_isDeleted" ON "files" ("isDeleted")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_storage_userId" ON "user_storage" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_group_storage_groupId" ON "group_storage" ("groupId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_group_storage_groupId"`);
    await queryRunner.query(`DROP INDEX "IDX_user_storage_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_files_isDeleted"`);
    await queryRunner.query(`DROP INDEX "IDX_files_isFolder"`);
    await queryRunner.query(`DROP INDEX "IDX_files_type"`);
    await queryRunner.query(`DROP INDEX "IDX_files_parent"`);
    await queryRunner.query(`DROP INDEX "IDX_files_group"`);
    await queryRunner.query(`DROP INDEX "IDX_files_uploader"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "group_storage" DROP CONSTRAINT "FK_group_storage_group"`);
    await queryRunner.query(`ALTER TABLE "user_storage" DROP CONSTRAINT "FK_user_storage_user"`);
    await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_files_parent"`);
    await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_files_group"`);
    await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_files_uploader"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "group_storage"`);
    await queryRunner.query(`DROP TABLE "user_storage"`);
    await queryRunner.query(`DROP TABLE "files"`);

    // Drop enum
    await queryRunner.query(`DROP TYPE "files_type_enum"`);
  }
}
