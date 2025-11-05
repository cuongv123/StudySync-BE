"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ai_chat_controller_1 = require("./ai-chat.controller");
const ai_chat_service_1 = require("./ai-chat.service");
const ai_query_history_entity_1 = require("./entities/ai-query-history.entity");
const conversation_entity_1 = require("./entities/conversation.entity");
const user_subscription_entity_1 = require("../subscription/entities/user-subscription.entity");
let AiChatModule = class AiChatModule {
};
exports.AiChatModule = AiChatModule;
exports.AiChatModule = AiChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                ai_query_history_entity_1.AiQueryHistory,
                conversation_entity_1.Conversation,
                user_subscription_entity_1.UserSubscription,
            ]),
        ],
        controllers: [ai_chat_controller_1.AiChatController],
        providers: [ai_chat_service_1.AiChatService],
        exports: [ai_chat_service_1.AiChatService],
    })
], AiChatModule);
//# sourceMappingURL=ai-chat.module.js.map