import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVideoCallTables1760080000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create call_status enum
    await queryRunner.query(`
      CREATE TYPE "call_status_enum" AS ENUM('waiting', 'ongoing', 'ended', 'cancelled')
    `);

    // Create video_calls table
    await queryRunner.query(`
      CREATE TABLE "video_calls" (
        "id" SERIAL NOT NULL,
        "groupId" integer NOT NULL,
        "callTitle" character varying(255),
        "startedBy" uuid NOT NULL,
        "status" "call_status_enum" NOT NULL DEFAULT 'waiting',
        "startedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "endedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_video_calls" PRIMARY KEY ("id")
      )
    `);

    // Create call_participants table
    await queryRunner.query(`
      CREATE TABLE "call_participants" (
        "id" SERIAL NOT NULL,
        "callId" integer NOT NULL,
        "userId" uuid NOT NULL,
        "peerId" character varying(255),
        "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "leftAt" TIMESTAMP,
        "isActive" boolean NOT NULL DEFAULT true,
        "isMuted" boolean NOT NULL DEFAULT false,
        "isVideoOff" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_call_participants" PRIMARY KEY ("id")
      )
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "video_calls"
      ADD CONSTRAINT "FK_video_calls_group"
      FOREIGN KEY ("groupId") REFERENCES "study_groups"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "video_calls"
      ADD CONSTRAINT "FK_video_calls_starter"
      FOREIGN KEY ("startedBy") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "call_participants"
      ADD CONSTRAINT "FK_call_participants_call"
      FOREIGN KEY ("callId") REFERENCES "video_calls"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "call_participants"
      ADD CONSTRAINT "FK_call_participants_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_video_calls_group" ON "video_calls" ("groupId")`);
    await queryRunner.query(`CREATE INDEX "IDX_video_calls_status" ON "video_calls" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_call_participants_call" ON "call_participants" ("callId")`);
    await queryRunner.query(`CREATE INDEX "IDX_call_participants_user" ON "call_participants" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_call_participants_active" ON "call_participants" ("isActive")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_call_participants_active"`);
    await queryRunner.query(`DROP INDEX "IDX_call_participants_user"`);
    await queryRunner.query(`DROP INDEX "IDX_call_participants_call"`);
    await queryRunner.query(`DROP INDEX "IDX_video_calls_status"`);
    await queryRunner.query(`DROP INDEX "IDX_video_calls_group"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "call_participants" DROP CONSTRAINT "FK_call_participants_user"`);
    await queryRunner.query(`ALTER TABLE "call_participants" DROP CONSTRAINT "FK_call_participants_call"`);
    await queryRunner.query(`ALTER TABLE "video_calls" DROP CONSTRAINT "FK_video_calls_starter"`);
    await queryRunner.query(`ALTER TABLE "video_calls" DROP CONSTRAINT "FK_video_calls_group"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "call_participants"`);
    await queryRunner.query(`DROP TABLE "video_calls"`);

    // Drop enum
    await queryRunner.query(`DROP TYPE "call_status_enum"`);
  }
}
