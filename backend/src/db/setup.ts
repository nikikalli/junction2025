#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import { databaseService } from '../services/database.service';
import * as path from 'path';

const execAsync = promisify(exec);

async function checkDockerInstalled(): Promise<boolean> {
  try {
    await execAsync('docker --version');
    return true;
  } catch {
    return false;
  }
}

async function checkDockerRunning(): Promise<boolean> {
  try {
    await execAsync('docker info');
    return true;
  } catch {
    return false;
  }
}

async function checkPostgresContainerRunning(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('docker ps --filter name=junction2025-postgres --format "{{.Names}}"');
    return stdout.trim() === 'junction2025-postgres';
  } catch {
    return false;
  }
}

async function startPostgresContainer(): Promise<void> {
  console.log('📦 Starting PostgreSQL container...');
  
  try {
    const backendDir = path.resolve(__dirname, '../..');
    await execAsync(`cd ${backendDir} && docker-compose up -d postgres`);
    console.log('✓ PostgreSQL container started');
    
    // Wait for PostgreSQL to be ready
    console.log('⏳ Waiting for PostgreSQL to be ready...');
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        const isConnected = await databaseService.testConnection();
        if (isConnected) {
          console.log('✓ PostgreSQL is ready');
          return;
        }
      } catch {
        // Connection failed, will retry
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    throw new Error('PostgreSQL container did not become ready in time');
  } catch (error: any) {
    console.error('❌ Failed to start PostgreSQL container:', error.message);
    throw error;
  }
}

async function initializeDatabase(): Promise<void> {
  console.log('📦 Initializing database schema...');
  
  try {
    const isConnected = await databaseService.testConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to database');
    }
    
    await databaseService.initializeSchema();
    console.log('✓ Database schema initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database schema:', error);
    throw error;
  }
}

export async function setupDatabase(): Promise<void> {
  console.log('\n🔧 Setting up database...\n');

  try {
    // Check if Docker is installed
    const isDockerInstalled = await checkDockerInstalled();
    if (!isDockerInstalled) {
      throw new Error('Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop');
    }
    console.log('✓ Docker is installed');

    // Check if Docker is running
    const isDockerRunning = await checkDockerRunning();
    if (!isDockerRunning) {
      throw new Error('Docker is not running. Please start Docker Desktop and try again.');
    }
    console.log('✓ Docker is running');

    // Check if PostgreSQL container is running
    let isContainerRunning = await checkPostgresContainerRunning();
    if (!isContainerRunning) {
      await startPostgresContainer();
      isContainerRunning = await checkPostgresContainerRunning();
      if (!isContainerRunning) {
        throw new Error('Failed to start PostgreSQL container');
      }
    } else {
      console.log('✓ PostgreSQL container is running');
    }

    // Initialize schema
    await initializeDatabase();

    console.log('\n✅ Database setup complete!\n');
  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}