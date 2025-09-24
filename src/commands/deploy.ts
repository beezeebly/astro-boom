import { execa } from 'execa';
import chalk from 'chalk';

export async function deployToNetlify(projectName: string) {
  try {
    console.log(chalk.blue('🚀 Deploying to Netlify...'));

    try {
      const { stdout } = await execa('netlify', ['deploy', '--dir=dist', '--prod'], {
        cwd: projectName
      });

      console.log(chalk.green('✅ Deployed to Netlify!'));
      console.log(stdout);
    } catch (error) {
      console.log(chalk.yellow('⚠️  Netlify CLI not found or not authenticated.'));
      console.log(chalk.yellow('   To deploy to Netlify:'));
      console.log(chalk.cyan('   1. Install Netlify CLI: npm i -g netlify-cli'));
      console.log(chalk.cyan('   2. Login: netlify login'));
      console.log(chalk.cyan(`   3. Deploy: cd ${projectName} && netlify deploy --dir=dist --prod`));
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Netlify deployment failed.'));
    throw error;
  }
}