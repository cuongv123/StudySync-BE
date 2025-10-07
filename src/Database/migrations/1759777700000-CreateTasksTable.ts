import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTasksTable1759777700000 implements MigrationInterface {
    name = 'CreateTasksTable1759777700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo enum cho task status
        await queryRunner.query(`
            CREATE TYPE "public"."tasks_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'overdue')
        `);

        // Tạo enum cho task priority
        await queryRunner.query(`
            CREATE TYPE "public"."tasks_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')
        `);

        // Tạo bảng tasks
        await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" SERIAL NOT NULL,
                "title" character varying(200) NOT NULL,
                "description" text,
                "groupId" integer NOT NULL,
                "assignedBy" uuid NOT NULL,
                "assignedTo" uuid NOT NULL,
                "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'pending',
                "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'medium',
                "deadline" TIMESTAMP NOT NULL,
                "completedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")
            )
        `);

        // Tạo foreign key cho groupId
        await queryRunner.query(`
            ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_groupId" 
            FOREIGN KEY ("groupId") REFERENCES "study_groups"("id") ON DELETE CASCADE
        `);

        // Tạo foreign key cho assignedBy
        await queryRunner.query(`
            ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_assignedBy" 
            FOREIGN KEY ("assignedBy") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        // Tạo foreign key cho assignedTo
        await queryRunner.query(`
            ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_assignedTo" 
            FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        // Tạo indexes để tối ưu query
        await queryRunner.query(`CREATE INDEX "idx_tasks_groupid" ON "tasks" ("groupId")`);
        await queryRunner.query(`CREATE INDEX "idx_tasks_assignedto" ON "tasks" ("assignedTo")`);
        await queryRunner.query(`CREATE INDEX "idx_tasks_status" ON "tasks" ("status")`);
        await queryRunner.query(`CREATE INDEX "idx_tasks_deadline" ON "tasks" ("deadline")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa indexes
        await queryRunner.query(`DROP INDEX "public"."idx_tasks_deadline"`);
        await queryRunner.query(`DROP INDEX "public"."idx_tasks_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_tasks_assignedto"`);
        await queryRunner.query(`DROP INDEX "public"."idx_tasks_groupid"`);

        // Xóa foreign keys
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_assignedTo"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_assignedBy"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_groupId"`);

        // Xóa bảng tasks
        await queryRunner.query(`DROP TABLE "tasks"`);

        // Xóa enums
        await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    }
}
