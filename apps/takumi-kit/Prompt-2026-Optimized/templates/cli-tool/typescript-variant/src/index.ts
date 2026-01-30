#!/usr/bin/env node
/**
 * CLI Entry Point
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { deployCommand } from './commands/deploy.js';
import { dbCommand } from './commands/db.js';
import { version, description } from './core/config.js';

const program = new Command();

program
  .name('mycli')
  .description(description)
  .version(version, '-v, --version', 'Output the current version');

// Register commands
program.addCommand(initCommand);
program.addCommand(deployCommand);
program.addCommand(dbCommand);

// Global error handler
program.exitOverride((err) => {
  if (err.code === 'commander.helpDisplayed') {
    process.exit(0);
  }
  if (err.code === 'commander.version') {
    process.exit(0);
  }
  console.error(chalk.red(`Error: ${err.message}`));
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
