const commander = require('commander');
const newCommand = require('./commands/new');

const program = new commander.Command();
program.version(require('./package.json').version);

program
  .option('-d, --debug', 'output extra debugging');

program
  .command('new <name> <version>')
  .description('Create a new template. For example "new visa" to kickstart new integration or "new visa v2" to add new version for existing one')
  .action((name, version) => {
    newCommand(name, version, program);
  });

program.parse(process.argv);
 



