/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/module/User/User.entity';

@Module({
  imports: [
    // ConfigModule đảm bảo biến môi trường được nạp trước
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.prod'
          : '.env.development',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const databaseUrl = configService.get<string>('DATABASE_URL');

        // Nếu có DATABASE_URL, sử dụng nó
        if (databaseUrl) {
          return {
            type: 'postgres',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            url: databaseUrl,
            entities: [User],
            synchronize: true, // Chỉ nên dùng trong development, tắt trong production
            migrations: [__dirname + '/../migrations/*{.ts,.js}'],
            retryAttempts: 5,
            retryDelay: 3000,
          };
        }

        // Nếu không có DATABASE_URL, dùng các biến DEV_DB_*
        return {
          type: 'postgres',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          host: configService.get<string>('DEV_DB_HOST'),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          port: configService.get<number>('DEV_DB_PORT'),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          username: configService.get<string>('DEV_DB_USERNAME', 'postgres'),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          password: configService.get<string>('DEV_DB_PASSWORD'),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          database: configService.get<string>('DEV_DB_DATABASE'),
          entities: [User],
          migrations:
            process.env.NODE_ENV === 'production'
              ? ['dist/migrations/*.js']
              : ['../migrations/*.ts'],
          synchronize: process.env.NODE_ENV !== 'production', // Tắt synchronize trong production
          retryAttempts: 5,
          retryDelay: 3000,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
