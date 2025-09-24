import { describe, test, expect } from '@jest/globals';
import { validateProjectName, checkIfDirectoryExists } from '../dist/utils/validate.js';
import fs from 'fs-extra';
import path from 'path';

describe('Validation Utils', () => {
  describe('validateProjectName', () => {
    test('accepts valid project names', () => {
      expect(validateProjectName('my-project')).toBe(true);
      expect(validateProjectName('test-site')).toBe(true);
      expect(validateProjectName('astro-123')).toBe(true);
    });

    test('rejects invalid project names', () => {
      expect(validateProjectName('My Project')).toBe(false);
      expect(validateProjectName('test site')).toBe(false);
      expect(validateProjectName('test_site')).toBe(false);
      expect(validateProjectName('Test-Site')).toBe(false);
    });
  });

  describe('checkIfDirectoryExists', () => {
    test('returns true for existing directory', async () => {
      const testDir = 'test-temp-dir';
      await fs.ensureDir(testDir);

      const exists = await checkIfDirectoryExists(testDir);
      expect(exists).toBe(true);

      await fs.remove(testDir);
    });

    test('returns false for non-existing directory', async () => {
      const exists = await checkIfDirectoryExists('non-existent-dir-xyz');
      expect(exists).toBe(false);
    });
  });
});