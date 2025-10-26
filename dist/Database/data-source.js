"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../module/User/entities/User.entity");
const dotenv = __importStar(require("dotenv"));
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
const ai_query_history_entity_1 = require("../module/ai-chat/entities/ai-query-history.entity");
dotenv.config({ path: '.env' });
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User_entity_1.User, token_entity_1.Token, group_entity_1.StudyGroup, group_member_entity_1.GroupMember, group_invitation_entity_1.GroupInvitation, notification_entity_1.Notification, task_entity_1.Task, message_entity_1.Message, subscription_plan_entity_1.SubscriptionPlan, user_subscription_entity_1.UserSubscription, subscription_payment_entity_1.SubscriptionPayment, file_entity_1.File, user_storage_entity_1.UserStorage, group_storage_entity_1.GroupStorage, ai_query_history_entity_1.AiQueryHistory],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: true,
    ssl: {
        rejectUnauthorized: false,
    },
    connectTimeoutMS: 60000,
    extra: {
        ssl: {
            rejectUnauthorized: false,
        },
    },
});
//# sourceMappingURL=data-source.js.map