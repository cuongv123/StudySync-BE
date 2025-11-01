import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { config } from './configs/config.Swaager';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptors';
import { LoggingInterceptor } from './common/interceptors/logging.interceptors';
import { ValidationPipe } from '@nestjs/common';

const envFilePath =
  process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.development';
dotenv.config({ path: envFilePath });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS Configuration
  app.enableCors({
    origin: [
      'https://studysync.id.vn',
      'https://www.studysync.id.vn',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
  });
  
  // Global Prefix
  app.setGlobalPrefix('/api/v1');
  // Global Filter
  app.useGlobalFilters(new AllExceptionsFilter());
  // Global Interceptor
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor()
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // Config Swagger
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  // Start Server
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
