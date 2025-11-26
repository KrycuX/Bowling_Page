import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/**/*{.ts,.js}'], // Poprawiona ścieżka do migracji
  migrationsTableName: 'typeorm_migrations', // Tabela do śledzenia migracji
  synchronize: false, // Use migrations
  logging: process.env.NODE_ENV === 'development',
  extra: {
    connectionLimit: 10,
  },
});
