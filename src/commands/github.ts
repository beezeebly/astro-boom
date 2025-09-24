import { execa } from 'execa';
import chalk from 'chalk';

export async function setupGitHub(projectName: string) {
  try {
    console.log(chalk.blue('🔗 Setting up GitHub repository...'));

    await execa('git', ['init'], { cwd: projectName });

    await execa('git', ['add', '.'], { cwd: projectName });

    await execa('git', ['commit', '-m', 'Initial commit'], { cwd: projectName });

    try {
      await execa('gh', ['repo', 'create', projectName, '--private', '--source=.', '--push'], {
        cwd: projectName
      });

      console.log(chalk.green('✅ GitHub repository created and pushed!'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  GitHub CLI not found or not authenticated.'));
      console.log(chalk.yellow('   To create a GitHub repo, run:'));
      console.log(chalk.cyan(`   cd ${projectName} && gh repo create --private`));
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Git setup failed. Make sure Git is installed.'));
    throw error;
  }
}