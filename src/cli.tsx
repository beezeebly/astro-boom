#!/usr/bin/env node
import chalk from 'chalk';

// Check for help flag first
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(chalk.cyan('💥 Astro Boom! - Create Your Static Site'));
  console.log('\nUsage:');
  console.log('  astro-boom                                    Interactive mode');
  console.log('  astro-boom --non-interactive [name]           Non-interactive mode');
  console.log('  astro-boom --non-interactive --auto [name]    Auto-install and start dev server');
  console.log('  astro-boom --help                             Show this help message');
  console.log('\nOptions:');
  console.log('  --non-interactive [name]       Create project with default settings');
  console.log('  --auto                         Auto-install deps and start dev server (with --non-interactive)');
  console.log('  -h, --help                     Show help');
  process.exit(0);
}

import React, { useState } from 'react';
import { render, Text, Box } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { default as Spinner } from 'ink-spinner';
import { createProject } from './commands/init.js';
import { setupGitHub } from './commands/github.js';
import { deployToNetlify } from './commands/deploy.js';
import path from 'path';

// Check for non-interactive mode
if (process.argv.includes('--non-interactive')) {
  const projectName = process.argv[3] || 'my-astro-site';
  console.log(chalk.cyan('💥 Astro Boom! - Creating project in non-interactive mode'));
  console.log(chalk.blue(`Project: ${projectName}`));

  createProject({
    name: projectName,
    newsLabel: 'news',
    teamLabel: 'team',
    analytics: 'none'
  })
    .then(async () => {
      console.log(chalk.green('✅ Success!'));
      console.log(`Your static site has been created at: ${chalk.cyan(projectName)}`);

      // Check if --auto flag is present for automatic setup
      if (process.argv.includes('--auto')) {
        const projectPath = path.join(process.cwd(), projectName);
        console.log(chalk.blue('\n📦 Installing dependencies...'));

        const { execaSync } = await import('execa');
        try {
          execaSync('npm', ['install'], { cwd: projectPath, stdio: 'inherit' });

          console.log(chalk.green('\n✅ Dependencies installed!'));
          console.log(chalk.blue('\n🚀 Starting development server...'));
          console.log(chalk.gray('\nPress Ctrl+C to stop the server\n'));

          execaSync('npm', ['run', 'dev'], { cwd: projectPath, stdio: 'inherit' });
        } catch (error: any) {
          if (error.signal === 'SIGINT') {
            console.log(chalk.yellow('\n\n👋 Development server stopped'));
            console.log(chalk.cyan(`\nTo start again:\n  cd ${projectName}\n  npm run dev`));
          } else {
            console.error(chalk.red('\n❌ Error during setup:'), error.message);
            console.log(chalk.yellow('\nPlease run manually:'));
            console.log(chalk.cyan(`  cd ${projectName}`));
            console.log(chalk.cyan('  npm install'));
            console.log(chalk.cyan('  npm run dev'));
          }
          process.exit(error.signal === 'SIGINT' ? 0 : 1);
        }
      } else {
        console.log('\nNext steps:');
        console.log(chalk.cyan(`  cd ${projectName}`));
        console.log(chalk.cyan('  npm install'));
        console.log(chalk.cyan('  npm run dev'));
        console.log(chalk.gray('\nOr run with --auto flag to automatically install and start:'));
        console.log(chalk.gray(`  npx astro-boom --non-interactive --auto ${projectName}`));
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error(chalk.red('❌ Error:'), error.message);
      process.exit(1);
    });
} else {

let unmount: any;

interface AppState {
  step: 'name' | 'newsType' | 'teamType' | 'github' | 'netlify' | 'analytics' | 'creating' | 'done' | 'autoSetup';
  projectName: string;
  newsLabel: 'news' | 'blog' | 'articles';
  teamLabel: 'people' | 'team';
  createGitHub: boolean;
  deployNetlify: boolean;
  analytics: 'plausible' | 'none';
  isCreating: boolean;
  autoInstall?: boolean;
  error?: string;
}

const App = () => {
  const [state, setState] = useState<AppState>({
    step: 'name',
    projectName: '',
    newsLabel: 'news',
    teamLabel: 'team',
    createGitHub: false,
    deployNetlify: false,
    analytics: 'plausible',
    isCreating: false
  });

  const handleProjectName = (value: string) => {
    setState({ ...state, projectName: value, step: 'newsType' });
  };

  const handleNewsType = (item: { value: string }) => {
    setState({ ...state, newsLabel: item.value as 'news' | 'blog' | 'articles', step: 'teamType' });
  };

  const handleTeamType = (item: { value: string }) => {
    setState({ ...state, teamLabel: item.value as 'people' | 'team', step: 'github' });
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
        newsLabel: state.newsLabel,
        teamLabel: state.teamLabel,
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

  if (state.step === 'newsType') {
    const items = [
      { label: 'News - For news and announcements', value: 'news' },
      { label: 'Blog - For blog posts and articles', value: 'blog' },
      { label: 'Articles - For written content', value: 'articles' }
    ];

    return (
      <Box flexDirection="column">
        <Text>What would you like to call your content section?</Text>
        <SelectInput items={items} onSelect={handleNewsType} />
      </Box>
    );
  }

  if (state.step === 'teamType') {
    const items = [
      { label: 'Team - For team members', value: 'team' },
      { label: 'People - For community members', value: 'people' }
    ];

    return (
      <Box flexDirection="column">
        <Text>What would you like to call your members section?</Text>
        <SelectInput items={items} onSelect={handleTeamType} />
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
    const handleAutoSetup = (item: any) => {
      if (item.value) {
        setState(prev => ({ ...prev, step: 'autoSetup', autoInstall: true }));

        const projectPath = path.join(process.cwd(), state.projectName);

        // Exit Ink render and run commands
        unmount();

        console.log(chalk.blue('\n📦 Installing dependencies...'));

        import('execa').then(({ execaSync }) => {
          try {
            execaSync('npm', ['install'], { cwd: projectPath, stdio: 'inherit' });

            console.log(chalk.green('\n✅ Dependencies installed!'));
            console.log(chalk.blue('\n🚀 Starting development server...'));
            console.log(chalk.gray('\nPress Ctrl+C to stop the server\n'));

            execaSync('npm', ['run', 'dev'], { cwd: projectPath, stdio: 'inherit' });
          } catch (error: any) {
            if (error.signal === 'SIGINT') {
              console.log(chalk.yellow('\n\n👋 Development server stopped'));
              console.log(chalk.cyan(`\nTo start again:\n  cd ${state.projectName}\n  npm run dev`));
            } else {
              console.error(chalk.red('\n❌ Error during setup:'), error.message);
              console.log(chalk.yellow('\nPlease run manually:'));
              console.log(chalk.cyan(`  cd ${state.projectName}`));
              console.log(chalk.cyan('  npm install'));
              console.log(chalk.cyan('  npm run dev'));
            }
            process.exit(error.signal === 'SIGINT' ? 0 : 1);
          }
        });
      } else {
        unmount();
        console.log(chalk.green('\n✨ Your project is ready!'));
        console.log(chalk.yellow('\nNext steps:'));
        console.log(chalk.cyan(`  cd ${state.projectName}`));
        console.log(chalk.cyan('  npm install'));
        console.log(chalk.cyan('  npm run dev'));
        process.exit(0);
      }
    };

    const items = [
      { label: 'Yes, install dependencies and start dev server', value: true },
      { label: 'No, I\'ll do it manually', value: false }
    ];

    return (
      <Box flexDirection="column">
        <Text color="green" bold>✅ Success!</Text>
        <Box marginTop={1} flexDirection="column">
          <Text>Your static site has been created at: {chalk.cyan(state.projectName)}</Text>
          <Box marginTop={1} flexDirection="column">
            <Text bold>Would you like to install dependencies and start the dev server?</Text>
            <SelectInput items={items} onSelect={handleAutoSetup} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (state.step === 'autoSetup') {
    return (
      <Box flexDirection="column">
        <Text color="blue">
          <Spinner type="dots" /> Setting up your project...
        </Text>
      </Box>
    );
  }

  return null;
};

const app = render(<App />);
unmount = app.unmount;
}