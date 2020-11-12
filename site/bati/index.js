const { Command } = require('commander');
const build = require('./build');
const dev = require('./dev');

const program = new Command();

program.command('build').action(build);

program.command('dev').action(dev);

program.parse(process.argv);
