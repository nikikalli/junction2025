import { databaseService } from '../services/database.service';

async function runMigration() {
  console.log('Starting database migration...');

  try {
    // Test connection
    const isConnected = await databaseService.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    console.log('✓ Database connection successful');

    // Initialize schema
    await databaseService.initializeSchema();
    console.log('✓ Database schema initialized successfully');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
