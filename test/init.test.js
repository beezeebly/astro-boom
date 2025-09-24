import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { createProject } from '../dist/commands/init.js';
import fs from 'fs-extra';
import path from 'path';

describe('Project Initialization', () => {
  const testProjectName = 'test-project-init';
  const testProjectPath = path.join(process.cwd(), testProjectName);

  beforeEach(async () => {
    await fs.remove(testProjectPath);
  });

  afterEach(async () => {
    await fs.remove(testProjectPath);
  });

  test('creates project with all required files', async () => {
    await createProject({
      name: testProjectName,
      analytics: 'none'
    });

    // Check essential files exist
    expect(await fs.pathExists(testProjectPath)).toBe(true);
    expect(await fs.pathExists(path.join(testProjectPath, 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(testProjectPath, 'astro.config.mjs'))).toBe(true);
    expect(await fs.pathExists(path.join(testProjectPath, 'tailwind.config.mjs'))).toBe(true);
    expect(await fs.pathExists(path.join(testProjectPath, 'netlify.toml'))).toBe(true);
    expect(await fs.pathExists(path.join(testProjectPath, 'tsconfig.json'))).toBe(true);
    expect(await fs.pathExists(path.join(testProjectPath, '.gitignore'))).toBe(true);
  });

  test('creates correct directory structure', async () => {
    await createProject({
      name: testProjectName,
      analytics: 'none'
    });

    // Check directory structure
    expect(await fs.pathExists(path.join(testProjectPath, 'src'))).toBe(true);
    expect(await fs.pathExists(path.join(testProjectPath, 'src/content'))).toBe(true);
    expect(await fs.pathExists(path.join(testProjectPath, 'src/layouts'))).toBe(true);
    expect(await fs.pathExists(path.join(testProjectPath, 'src/pages'))).toBe(true);
    expect(await fs.pathExists(path.join(testProjectPath, 'src/components'))).toBe(true);
    expect(await fs.pathExists(path.join(testProjectPath, 'public/admin'))).toBe(true);
  });

  test('creates content collections', async () => {
    await createProject({
      name: testProjectName,
      analytics: 'none'
    });

    const contentPath = path.join(testProjectPath, 'src/content');
    expect(await fs.pathExists(path.join(contentPath, 'config.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(contentPath, 'pages'))).toBe(true);
    expect(await fs.pathExists(path.join(contentPath, 'news'))).toBe(true);
    expect(await fs.pathExists(path.join(contentPath, 'events'))).toBe(true);
    expect(await fs.pathExists(path.join(contentPath, 'people'))).toBe(true);
  });

  test('adds Plausible analytics when selected', async () => {
    await createProject({
      name: testProjectName,
      analytics: 'plausible'
    });

    const layoutPath = path.join(testProjectPath, 'src/layouts/BaseLayout.astro');
    const layoutContent = await fs.readFile(layoutPath, 'utf-8');
    expect(layoutContent).toContain('plausible.io');
  });

  test('package.json has correct scripts', async () => {
    await createProject({
      name: testProjectName,
      analytics: 'none'
    });

    const packageJson = await fs.readJson(path.join(testProjectPath, 'package.json'));
    expect(packageJson.scripts).toHaveProperty('dev');
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts).toHaveProperty('preview');
    expect(packageJson.scripts.build).toContain('pagefind');
  });
});