import { setupDatabase } from './db/setup';
import { spawn } from 'child_process';
import * as path from 'path';

async function startDev() {
  try {
    // Setup database before starting the dev server
    await setupDatabase();

    // Start the actual dev server using tsx watch
    console.log('Starting development server with hot reload...\n');

    const indexPath = path.join(__dirname, 'index.ts');
    const child = spawn('npx', ['tsx', 'watch', indexPath], {
      stdio: 'inherit',
      shell: true,
    });

    child.on('exit', (code) => {
      process.exit(code || 0);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      child.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      child.kill('SIGTERM');
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to setup database. Please fix the issues and try again.');
    process.exit(1);
  }
}

startDev();
