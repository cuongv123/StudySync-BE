import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationSupport1760200000000 implements MigrationInterface {
    name = 'AddConversationSupport1760200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Tạo bảng ai_conversations
        await queryRunner.query(`
            CREATE TABLE "ai_conversations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "title" character varying(255),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ai_conversations" PRIMARY KEY ("id")
            )
        `);

        // 2. Thêm cột conversationId vào bảng ai_query_history
        await queryRunner.query(`
            ALTER TABLE "ai_query_history" 
            ADD COLUMN "conversationId" uuid
        `);

        // 3. Tạo foreign key từ ai_query_history → ai_conversations
        await queryRunner.query(`
            ALTER TABLE "ai_query_history" 
            ADD CONSTRAINT "FK_ai_query_history_conversation" 
            FOREIGN KEY ("conversationId") 
            REFERENCES "ai_conversations"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        // 4. Tạo index cho performance
        await queryRunner.query(`
            CREATE INDEX "IDX_ai_conversations_userId" 
            ON "ai_conversations" ("userId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_ai_query_history_conversationId" 
            ON "ai_query_history" ("conversationId")
        `);

        // 5. Migrate data cũ: Tạo conversation cho mỗi message cũ (optional)
        // Nếu muốn giữ data cũ, uncomment phần này:
        /*
        await queryRunner.query(`
            INSERT INTO "ai_conversations" ("id", "userId", "title", "createdAt", "updatedAt")
            SELECT 
                uuid_generate_v4() as id,
                "userId",
                LEFT("queryText", 50) || '...' as title,
                "createdAt",
                "createdAt" as updatedAt
            FROM "ai_query_history"
            WHERE "conversationId" IS NULL
        `);
        */
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ai_query_history_conversationId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ai_conversations_userId"`);

        // Drop foreign key
        await queryRunner.query(`
            ALTER TABLE "ai_query_history" 
            DROP CONSTRAINT IF EXISTS "FK_ai_query_history_conversation"
        `);

        // Drop column
        await queryRunner.query(`
            ALTER TABLE "ai_query_history" 
            DROP COLUMN IF EXISTS "conversationId"
        `);

        // Drop table
        await queryRunner.query(`DROP TABLE IF EXISTS "ai_conversations"`);
    }
}
