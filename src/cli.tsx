#!/usr/bin/env node
import React, { useState } from 'react';
import { render, Text, Box } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { createProject } from './commands/init.js';
import { setupGitHub } from './commands/github.js';
import { deployToNetlify } from './commands/deploy.js';
import chalk from 'chalk';

// Check for non-interactive mode
if (process.argv.includes('--non-interactive')) {
  const projectName = process.argv[3] || 'my-astro-site';
  console.log(chalk.cyan('💥 Astro Boom! - Creating project in non-interactive mode'));
  console.log(chalk.blue(`Project: ${projectName}`));

  createProject({ name: projectName, analytics: 'none' })
    .then(() => {
      console.log(chalk.green('✅ Success!'));
      console.log(`Your static site has been created at: ${chalk.cyan(projectName)}`);
      console.log('\nNext steps:');
      console.log(`  cd ${projectName}`);
      console.log('  npm install');
      console.log('  npm run dev');
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    });
} else {

interface AppState {
  step: 'name' | 'github' | 'netlify' | 'analytics' | 'creating' | 'done';
  projectName: string;
  createGitHub: boolean;
  deployNetlify: boolean;
  analytics: 'plausible' | 'none';
  isCreating: boolean;
  error?: string;
}

const App = () => {
  const [state, setState] = useState<AppState>({
    step: 'name',
    projectName: '',
    createGitHub: false,
    deployNetlify: false,
    analytics: 'plausible',
    isCreating: false
  });

  const handleProjectName = (value: string) => {
    setState({ ...state, projectName: value, step: 'github' });
  };

  const handleGitHub = (item: { value: boolean }) => {
    setState({ ...state, createGitHub: item.value, step: 'netlify' });
  };

  const handleNetlify = (item: { value: boolean }) => {
    setState({ ...state, deployNetlify: item.value, step: 'analytics' });
  };

  const handleAnalytics = (item: { value: string }) => {
    setState({ ...state, analytics: item.value as 'plausible' | 'none', step: 'creating' });
    createSite();
  };

  const createSite = async () => {
    setState(prev => ({ ...prev, isCreating: true }));

    try {
      await createProject({
        name: state.projectName,
        analytics: state.analytics
      });

      if (state.createGitHub) {
        await setupGitHub(state.projectName);
      }

      if (state.deployNetlify) {
        await deployToNetlify(state.projectName);
      }

      setState(prev => ({ ...prev, step: 'done', isCreating: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isCreating: false
      }));
    }
  };

  if (state.error) {
    return (
      <Box flexDirection="column">
        <Text color="red">❌ Error: {state.error}</Text>
      </Box>
    );
  }

  if (state.step === 'name') {
    return (
      <Box flexDirection="column">
        <Text bold color="cyan">💥 Astro Boom! - Create Your Static Site</Text>
        <Box marginTop={1}>
          <Text>Project name: </Text>
          <TextInput value={state.projectName} onChange={(value) => setState({...state, projectName: value})} onSubmit={handleProjectName} />
        </Box>
      </Box>
    );
  }

  if (state.step === 'github') {
    const items = [
      { label: 'Yes, create GitHub repository', value: true },
      { label: 'No, skip GitHub setup', value: false }
    ];

    return (
      <Box flexDirection="column">
        <Text>Create GitHub repository?</Text>
        <SelectInput items={items} onSelect={handleGitHub} />
      </Box>
    );
  }

  if (state.step === 'netlify') {
    const items = [
      { label: 'Yes, deploy to Netlify', value: true },
      { label: 'No, I\'ll deploy later', value: false }
    ];

    return (
      <Box flexDirection="column">
        <Text>Deploy to Netlify?</Text>
        <SelectInput items={items} onSelect={handleNetlify} />
      </Box>
    );
  }

  if (state.step === 'analytics') {
    const items = [
      { label: 'Plausible (privacy-first)', value: 'plausible' },
      { label: 'None', value: 'none' }
    ];

    return (
      <Box flexDirection="column">
        <Text>Choose analytics provider:</Text>
        <SelectInput items={items} onSelect={handleAnalytics} />
      </Box>
    );
  }

  if (state.step === 'creating') {
    return (
      <Box flexDirection="column">
        <Text color="green">
          <Spinner type="dots" /> Creating your static site...
        </Text>
      </Box>
    );
  }

  if (state.step === 'done') {
    return (
      <Box flexDirection="column">
        <Text color="green" bold>✅ Success!</Text>
        <Box marginTop={1} flexDirection="column">
          <Text>Your static site has been created at: {chalk.cyan(state.projectName)}</Text>
          <Box marginTop={1} flexDirection="column">
            <Text bold>Next steps:</Text>
            <Text>  cd {state.projectName}</Text>
            <Text>  npm install</Text>
            <Text>  npm run dev</Text>
          </Box>
        </Box>
      </Box>
    );
  }

  return null;
};

render(<App />);
}