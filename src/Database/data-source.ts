import { DataSource } from 'typeorm';
// Update the import path to match the actual location and filename of User.entity.ts
import { User } from '../module/user/user.entity';
import * as dotenv from 'dotenv';
import { Token } from 'src/module/token/token.entity';



dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DEV_DB_HOST || 'localhost',
  port: parseInt(process.env.DEV_DB_PORT || '5432', 10),
  username: process.env.DEV_DB_USERNAME || 'postgres',
  password: process.env.DEV_DB_PASSWORD || '',
  database: process.env.DEV_DB_DATABASE || 'studysync',
  entities: [User,Token],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});