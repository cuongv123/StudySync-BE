"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAiQueryHistoryTable1761580000000 = void 0;
class CreateAiQueryHistoryTable1761580000000 {
    constructor() {
        this.name = 'CreateAiQueryHistoryTable1761580000000';
    }
    async up(queryRunner) {
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
        await queryRunner.query(`CREATE INDEX "IDX_ai_query_history_userId" ON "ai_query_history"("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_ai_query_history_createdAt" ON "ai_query_history"("createdAt")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ai_query_history_createdAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ai_query_history_userId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ai_query_history"`);
    }
}
exports.CreateAiQueryHistoryTable1761580000000 = CreateAiQueryHistoryTable1761580000000;
//# sourceMappingURL=1761580000000-CreateAiQueryHistoryTable.js.map