import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { config } from './configs/config.Swaager';
const envFilePath =
  process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.development';
dotenv.config({ path: envFilePath });
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');
  // Config Swagger
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
