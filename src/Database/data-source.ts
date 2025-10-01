import { DataSource } from 'typeorm';
// Update the import path to match the actual location and filename of User.entity.ts
import { User } from '../module/User/User.entity';
import * as dotenv from 'dotenv';
import { Token } from 'src/module/token/token.entity';

dotenv.config({ path: '.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // sử dụng connection string Supabase
  entities: [User, Token],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false, // tắt vì bạn dùng migrations
  logging: true,
  ssl: {
    rejectUnauthorized: false, // Cần thiết cho Supabase
  },
  connectTimeoutMS: 60000, // 60 seconds timeout
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
