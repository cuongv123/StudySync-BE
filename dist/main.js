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
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const dotenv = __importStar(require("dotenv"));
require("reflect-metadata");
const config_Swaager_1 = require("./configs/config.Swaager");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const transform_interceptors_1 = require("./common/interceptors/transform.interceptors");
const logging_interceptors_1 = require("./common/interceptors/logging.interceptors");
const common_1 = require("@nestjs/common");
const envFilePath = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.development';
dotenv.config({ path: envFilePath });
async function bootstrap() {
    var _a;
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('/api/v1');
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new logging_interceptors_1.LoggingInterceptor(), new transform_interceptors_1.TransformInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const document = swagger_1.SwaggerModule.createDocument(app, config_Swaager_1.config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    });
    await app.listen((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map