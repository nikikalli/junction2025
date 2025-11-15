#!/usr/bin/env node
import { databaseService } from '../services/database.service';

async function healthCheck() {
  console.log('🏥 Running database health check...\n');

  try {
    // Test connection
    const isConnected = await databaseService.testConnection();
    if (!isConnected) {
      console.error('❌ Database connection failed');
      process.exit(1);
    }
    console.log('✓ Database connection: OK');

    // Test query execution
    const campaigns = await databaseService.getAllCampaigns();
    console.log(`✓ Query execution: OK (${campaigns.length} campaigns found)`);

    // Test JOIN query
    const campaignsWithData = await databaseService.getAllCampaignsWithImplementations();
    console.log(`✓ JOIN queries: OK (${campaignsWithData.length} campaigns with implementations)`);

    console.log('\n✅ All health checks passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Health check failed:', error);
    process.exit(1);
  }
}

healthCheck();
