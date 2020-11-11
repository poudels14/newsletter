const { Command } = require('commander');
const build = require('./build');

const program = new Command();

program
  .command('build')
  .option('-d, --debug', 'Output debug logs')
  .option(
    '-f, --files [files...]',
    'Files to build and generate HTML pages from'
  )
  .action(build);

program.parse(process.argv);
