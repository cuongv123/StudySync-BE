import { AppDataSource } from './data-source';

async function clearMigrations() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to database');

    // Clear migrations table
    await AppDataSource.query('DELETE FROM migrations');
    console.log('✅ Migrations table cleared');

    await AppDataSource.destroy();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearMigrations();
