"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const User_entity_1 = require("../module/User/entities/User.entity");
const token_entity_1 = require("../module/token/token.entity");
const group_entity_1 = require("../module/group/entities/group.entity");
const group_member_entity_1 = require("../module/group/entities/group-member.entity");
const group_invitation_entity_1 = require("../module/group/entities/group-invitation.entity");
const notification_entity_1 = require("../module/notification/entities/notification.entity");
const task_entity_1 = require("../module/task/entities/task.entity");
const message_entity_1 = require("../module/chat/entities/message.entity");
const subscription_plan_entity_1 = require("../module/subscription/entities/subscription-plan.entity");
const user_subscription_entity_1 = require("../module/subscription/entities/user-subscription.entity");
const subscription_payment_entity_1 = require("../module/subscription/entities/subscription-payment.entity");
const file_entity_1 = require("../module/file/entities/file.entity");
const user_storage_entity_1 = require("../module/file/entities/user-storage.entity");
const group_storage_entity_1 = require("../module/file/entities/group-storage.entity");
const video_call_entity_1 = require("../module/video-call/entities/video-call.entity");
const call_participant_entity_1 = require("../module/video-call/entities/call-participant.entity");
const ai_query_history_entity_1 = require("../module/ai-chat/entities/ai-query-history.entity");
const review_entity_1 = require("../module/review/entities/review.entity");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const databaseUrl = configService.get('DATABASE_URL');
                    if (databaseUrl) {
                        return {
                            type: 'postgres',
                            url: databaseUrl,
                            entities: [User_entity_1.User, token_entity_1.Token, group_entity_1.StudyGroup, group_member_entity_1.GroupMember, group_invitation_entity_1.GroupInvitation, notification_entity_1.Notification, task_entity_1.Task, message_entity_1.Message, subscription_plan_entity_1.SubscriptionPlan, user_subscription_entity_1.UserSubscription, subscription_payment_entity_1.SubscriptionPayment, file_entity_1.File, user_storage_entity_1.UserStorage, group_storage_entity_1.GroupStorage, video_call_entity_1.VideoCall, call_participant_entity_1.CallParticipant, ai_query_history_entity_1.AiQueryHistory, review_entity_1.Review],
                            migrations: [__dirname + '/../migrations/*{.ts,.js}'],
                            synchronize: false,
                            logging: ['query', 'error'],
                            retryAttempts: 5,
                            retryDelay: 3000,
                            ssl: {
                                rejectUnauthorized: false,
                            },
                        };
                    }
                    return {
                        type: 'postgres',
                        host: configService.get('DEV_DB_HOST', 'localhost'),
                        port: configService.get('DEV_DB_PORT', 5432),
                        username: configService.get('DEV_DB_USERNAME', 'postgres'),
                        password: configService.get('DEV_DB_PASSWORD', ''),
                        database: configService.get('DEV_DB_DATABASE', 'studysync'),
                        entities: [User_entity_1.User, token_entity_1.Token, group_entity_1.StudyGroup, group_member_entity_1.GroupMember, group_invitation_entity_1.GroupInvitation, notification_entity_1.Notification, task_entity_1.Task, message_entity_1.Message, subscription_plan_entity_1.SubscriptionPlan, user_subscription_entity_1.UserSubscription, subscription_payment_entity_1.SubscriptionPayment, file_entity_1.File, user_storage_entity_1.UserStorage, group_storage_entity_1.GroupStorage, video_call_entity_1.VideoCall, call_participant_entity_1.CallParticipant, ai_query_history_entity_1.AiQueryHistory, review_entity_1.Review],
                        migrations: process.env.NODE_ENV === 'production'
                            ? ['dist/migrations/*.js']
                            : ['../migrations/*.ts'],
                        synchronize: true,
                        logging: true,
                        retryAttempts: 5,
                        retryDelay: 3000,
                    };
                },
            }),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=postgres.config.js.map