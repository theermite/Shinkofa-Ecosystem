/**
 * Init Command
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { logger } from '../core/logger.js';
import { getConfig } from '../core/config.js';

export const initCommand = new Command('init')
  .description('Initialize a new project')
  .option('-n, --name <name>', 'Project name')
  .option('-d, --dir <directory>', 'Target directory', process.cwd())
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (options) => {
    logger.info('Initializing project...');

    let projectName = options.name;

    // Prompt for project name if not provided
    if (!projectName && !options.yes) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Project name:',
          default: 'my-project',
          validate: (input) => (input.trim().length > 0 ? true : 'Project name cannot be empty'),
        },
      ]);
      projectName = answers.projectName;
    } else if (!projectName) {
      projectName = 'my-project';
    }

    const spinner = ora(`Creating project: ${chalk.cyan(projectName)}`).start();

    try {
      const config = getConfig();
      const projectDir = join(options.dir, projectName);

      // Create project directory
      await mkdir(projectDir, { recursive: true });

      // Create basic structure
      await mkdir(join(projectDir, 'src'), { recursive: true });
      await mkdir(join(projectDir, 'tests'), { recursive: true });

      // Create README
      const readme = `# ${projectName}\n\nCreated with mycli.\n`;
      await writeFile(join(projectDir, 'README.md'), readme);

      // Create .env example
      const envExample = `# Configuration\nLOG_LEVEL=info\n`;
      await writeFile(join(projectDir, '.env.example'), envExample);

      spinner.succeed(chalk.green(`Project ${chalk.cyan(projectName)} created successfully!`));

      logger.info('Next steps:');
      console.log(`  cd ${projectName}`);
      console.log(`  # Start building!`);
    } catch (error) {
      spinner.fail(chalk.red('Project initialization failed'));
      logger.error((error as Error).message);
      process.exit(1);
    }
  });
