import fs from 'fs-extra';
import path from 'path';

export function validateProjectName(name: string): boolean {
  const validNameRegex = /^[a-z0-9-]+$/;
  return validNameRegex.test(name);
}

export async function checkIfDirectoryExists(name: string): Promise<boolean> {
  const projectPath = path.join(process.cwd(), name);
  return await fs.pathExists(projectPath);
}

export function checkRequirements(): { valid: boolean; missing: string[] } {
  const requirements = ['node', 'npm'];
  const missing: string[] = [];

  requirements.forEach(cmd => {
    try {
      require('child_process').execSync(`which ${cmd}`, { stdio: 'ignore' });
    } catch {
      missing.push(cmd);
    }
  });

  return {
    valid: missing.length === 0,
    missing
  };
}