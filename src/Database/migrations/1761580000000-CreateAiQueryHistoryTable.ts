import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAiQueryHistoryTable1761580000000 implements MigrationInterface {
    name = 'CreateAiQueryHistoryTable1761580000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create ai_query_history table
        await queryRunner.query(`
            CREATE TABLE "ai_query_history" (
                "id" SERIAL PRIMARY KEY,
                "userId" uuid NOT NULL,
                "queryText" text NOT NULL,
                "responseText" text NOT NULL,
                "createdAt" timestamp NOT NULL DEFAULT now(),
                CONSTRAINT "FK_ai_query_history_userId" FOREIGN KEY ("userId") 
                    REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_ai_query_history_userId" ON "ai_query_history"("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_ai_query_history_createdAt" ON "ai_query_history"("createdAt")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ai_query_history_createdAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ai_query_history_userId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ai_query_history"`);
    }
}
