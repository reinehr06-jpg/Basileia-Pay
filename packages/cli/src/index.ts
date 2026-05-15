#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('basileia')
  .description('Basileia Pay CLI — integração e debug por terminal')
  .version('1.0.0');

// Mock actions for now
program
  .command('checkout create')
  .description('Criar uma checkout session')
  .option('-s, --system <id>', 'System ID ou slug')
  .option('-a, --amount <cents>', 'Valor em centavos')
  .action((options) => {
    console.log(chalk.green('✓ Checkout session criada com sucesso!'));
    console.log(chalk.gray('URL: https://pay.basileia.com/sess_9x2b81'));
  });

program
  .command('webhooks listen')
  .description('Escutar webhooks localmente com túnel automático')
  .option('-p, --port <port>', 'Porta local', '3001')
  .action((options) => {
    console.log(chalk.cyan('\n  Basileia Webhooks — Modo de escuta ativo\n'));
    console.log(chalk.gray(`  Porta local: ${options.port}`));
    console.log(chalk.yellow('  Aguardando webhooks...\n'));
  });

program
  .command('auth login')
  .description('Autenticar com API key')
  .action(() => {
    console.log(chalk.green('✓ Autenticado com sucesso na empresa "Basileia Church"'));
  });

program.parse();
