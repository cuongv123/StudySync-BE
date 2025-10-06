import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatFieldsToMessages1759782366000 implements MigrationInterface {
    name = 'AddChatFieldsToMessages1759782366000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum for message type (check if exists first)
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."messages_type_enum" AS ENUM('text', 'image', 'file', 'system');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        // Add new columns to messages table
        await queryRunner.query(`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "type" "public"."messages_type_enum" NOT NULL DEFAULT 'text'`);
        await queryRunner.query(`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "attachments" jsonb`);
        await queryRunner.query(`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "isEdited" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "isDeleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "replyToId" integer`);
        await queryRunner.query(`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        
        // Add foreign key constraint for replyToId (check if exists first)
        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "messages" ADD CONSTRAINT "FK_messages_replyToId" 
                FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_messages_type" ON "messages" ("type")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_messages_isDeleted" ON "messages" ("isDeleted")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_messages_replyToId" ON "messages" ("replyToId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_messages_replyToId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_messages_isDeleted"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_messages_type"`);
        
        // Drop foreign key constraint
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "FK_messages_replyToId"`);
        
        // Drop columns
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "replyToId"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "isDeleted"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "isEdited"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "attachments"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "type"`);
        
        // Drop enum type
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."messages_type_enum"`);
    }
}
