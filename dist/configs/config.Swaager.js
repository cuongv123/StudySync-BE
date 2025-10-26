"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const swagger_1 = require("@nestjs/swagger");
exports.config = new swagger_1.DocumentBuilder()
    .setTitle('StudySync')
    .setDescription('back-end for StudySync application')
    .setVersion('1.0')
    .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'Authorization',
    description: 'Enter JWT access token',
    in: 'header',
}, 'JWT-auth')
    .build();
//# sourceMappingURL=config.Swaager.js.map