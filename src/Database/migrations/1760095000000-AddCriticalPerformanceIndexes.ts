import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCriticalPerformanceIndexes1760095000000 implements MigrationInterface {
    name = 'AddCriticalPerformanceIndexes1760095000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // =================== CRITICAL INDEXES ONLY ===================
        // Only create indexes for columns that are verified to exist
        
        console.log('Creating performance indexes...');

        // GROUP_MEMBERS - Most critical for permission checks
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_group_members_user_group" 
            ON "group_members"("userId", "groupId")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_group_members_userId" 
            ON "group_members"("userId")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_group_members_groupId" 
            ON "group_members"("groupId")
        `);

        // GROUP_INVITATIONS - For invitation lookups
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_group_invitations_group_email_status" 
            ON "group_invitations"("groupId", "inviteEmail", "status")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_group_invitations_inviterId" 
            ON "group_invitations"("inviterId")
        `);

        // NOTIFICATIONS - For unread counts and filtering  
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_notifications_userId_isRead" 
            ON "notifications"("userId", "isRead") 
            WHERE "isRead" = false
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_notifications_userId_createdAt" 
            ON "notifications"("userId", "createdAt" DESC)
        `);

        // MESSAGES - For chat history
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_messages_groupId_createdAt" 
            ON "messages"("groupId", "createdAt" DESC)
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_messages_senderId" 
            ON "messages"("senderId")
        `);

        // TASKS - For task filtering
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_tasks_groupId_status" 
            ON "tasks"("groupId", "status")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_tasks_assignedTo" 
            ON "tasks"("assignedTo") 
            WHERE "assignedTo" IS NOT NULL
        `);

        // STUDY_GROUPS - For active groups listing
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_study_groups_leaderId" 
            ON "study_groups"("leaderId")
        `);

        console.log('✅ Critical performance indexes created successfully');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_study_groups_leaderId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_assignedTo"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_groupId_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_senderId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_groupId_createdAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_userId_createdAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_userId_isRead"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_group_invitations_inviterId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_group_invitations_group_email_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_group_members_groupId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_group_members_userId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_group_members_user_group"`);

        console.log('✅ Performance indexes dropped');
    }
}
