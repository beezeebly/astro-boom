import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

describe('CLI Integration Tests', () => {
  const testProjectName = 'integration-test-site';
  const testProjectPath = path.join(process.cwd(), testProjectName);

  beforeAll(async () => {
    await fs.remove(testProjectPath);
  });

  afterAll(async () => {
    await fs.remove(testProjectPath);
  });

  test('CLI creates project successfully', async () => {
    const cliPath = path.join(process.cwd(), 'dist', 'cli.js');

    await new Promise((resolve, reject) => {
      const proc = spawn('node', [cliPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, CI: 'true' }
      });

      let output = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
      });

      proc.stderr.on('data', (data) => {
        output += data.toString();
      });

      // Send inputs
      setTimeout(() => {
        proc.stdin.write(testProjectName + '\n');
        setTimeout(() => {
          proc.stdin.write('\x1B[B\n'); // No to GitHub
          setTimeout(() => {
            proc.stdin.write('\x1B[B\n'); // No to Netlify
            setTimeout(() => {
              proc.stdin.write('\n'); // Plausible
            }, 500);
          }, 500);
        }, 500);
      }, 1000);

      proc.on('exit', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`CLI exited with code ${code}: ${output}`));
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        proc.kill();
        reject(new Error('CLI timeout'));
      }, 30000);
    });

    // Verify project was created
    expect(await fs.pathExists(testProjectPath)).toBe(true);
    expect(await fs.pathExists(path.join(testProjectPath, 'package.json'))).toBe(true);
  }, 35000); // 35 second timeout for this test
});