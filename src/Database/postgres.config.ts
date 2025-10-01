import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/module/User/User.entity';
import { Token } from 'src/module/token/token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (databaseUrl) {
          // ✅ Khi dùng Supabase (DATABASE_URL)
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [User, Token],
            migrations: [__dirname + '/../migrations/*{.ts,.js}'],
            synchronize: false, // 🚨 tắt, chỉ dùng migrations
            logging: true,
            retryAttempts: 5,
            retryDelay: 3000,
            ssl: {
              rejectUnauthorized: false, // Cần thiết cho Supabase
            },
          };
        }

        // ✅ Khi chạy local dev
        return {
          type: 'postgres',
          host: configService.get<string>('DEV_DB_HOST', 'localhost'),
          port: configService.get<number>('DEV_DB_PORT', 5432),
          username: configService.get<string>('DEV_DB_USERNAME', 'postgres'),
          password: configService.get<string>('DEV_DB_PASSWORD', ''),
          database: configService.get<string>('DEV_DB_DATABASE', 'studysync'),
          entities: [User, Token],
          migrations:
            process.env.NODE_ENV === 'production'
              ? ['dist/migrations/*.js']
              : ['../migrations/*.ts'],
          synchronize: true, // cho phép sync nhanh ở local
          logging: true,
          retryAttempts: 5,
          retryDelay: 3000,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
