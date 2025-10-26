"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const User_module_1 = require("./module/User/User.module");
const postgres_config_1 = require("./Database/postgres.config");
const auth_module_1 = require("./module/auth/auth.module");
const token_module_1 = require("./module/token/token.module");
const mail_module_1 = require("./shared/mail/mail.module");
const group_module_1 = require("./module/group/group.module");
const notification_module_1 = require("./module/notification/notification.module");
const task_module_1 = require("./module/task/task.module");
const chat_module_1 = require("./module/chat/chat.module");
const subscription_module_1 = require("./module/subscription/subscription.module");
const payment_module_1 = require("./module/payment/payment.module");
const file_module_1 = require("./module/file/file.module");
const video_call_module_1 = require("./module/video-call/video-call.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [User_module_1.UserModule, postgres_config_1.DatabaseModule, auth_module_1.AuthModule, token_module_1.TokenModule, mail_module_1.MailModule, group_module_1.GroupModule, notification_module_1.NotificationModule, task_module_1.TaskModule, chat_module_1.ChatModule, subscription_module_1.SubscriptionModule, payment_module_1.PaymentModule, file_module_1.FileModule, video_call_module_1.VideoCallModule],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map