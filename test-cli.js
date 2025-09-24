#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';

console.log('🧪 Testing Astro Boom CLI...\n');

// Test project name
const testProjectName = 'test-astro-site';

// Simulate user inputs
const inputs = [
  testProjectName,  // project name
  '\n',             // Enter
  '\x1B[B',         // Arrow down (No to GitHub)
  '\n',             // Enter
  '\x1B[B',         // Arrow down (No to Netlify)
  '\n',             // Enter
  '\n'              // Enter (Plausible analytics)
];

const cliPath = path.join(process.cwd(), 'dist', 'cli.js');

const proc = spawn('node', [cliPath], {
  stdio: ['pipe', 'inherit', 'inherit']
});

let inputIndex = 0;

// Send inputs with delays
function sendNextInput() {
  if (inputIndex < inputs.length) {
    proc.stdin.write(inputs[inputIndex]);
    inputIndex++;
    setTimeout(sendNextInput, 500);
  }
}

proc.on('spawn', () => {
  console.log('CLI started, sending test inputs...\n');
  setTimeout(sendNextInput, 1000);
});

proc.on('exit', (code) => {
  console.log(`\n✅ CLI exited with code: ${code}`);

  if (code === 0) {
    console.log(`\n📁 Check the generated project at: ./${testProjectName}`);
    console.log('\nTo verify the generated site:');
    console.log(`  cd ${testProjectName}`);
    console.log('  npm install');
    console.log('  npm run dev');
  }
});