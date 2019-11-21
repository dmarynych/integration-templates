const commander = require('commander');
const newCommand = require('./commands/new');

const vgsCli = require('./src/utils/vgs-cli');
const runner = require('./src/runner');
const log = require('./src/utils/log');
const cmn = require('./src/utils/common');

const program = new commander.Command();
program.version(require('./package.json').version);


program
	.option('-d, --debug', 'output extra debugging');

program
	.command('new <name> [version]')
	.description('Create a new template. For example "new visa v1" to kickstart new integration')
	.action((name, version = 'default') => {
		newCommand(name, version, program);
	});

program
	.command('show')
	.description('Show list of integrations')
	.action(() => {
		const integrationList = cmn.getIntegrationList();
		log.show(integrationList);
	});


program
	.command('apply <name> [version]')
	.description('Apply integration. For example "apply visa v1" to save routes')
  .requiredOption('-e, --environment <environment>', 'VGS environment, might be "dev", "sandbox"')
	.action((name, version = 'default', cmd) => {
		runner.runDumpAndSync(name, version, cmd.environment);
	});

program
	.command('test <name> [version]')
	.description('Test integration. For example "test visa v1" to test if it works')
  .requiredOption('-e, --environment <environment>', 'VGS environment, might be "dev", "sandbox"')
	.action((name, version = 'default') => {
		runner.tryToRun(name, version);
	});

program
	.command('dump')
	.description('Dump routes, using creds file "stuff/credentials/creds.json"')
	.requiredOption('-e, --environment <environment>', 'VGS environment, might be "dev", "sandbox"')
	.action((cmd) => {
		vgsCli.runDump(cmd.environment);
	});

program
  .command('auth')
  .description('Auth on VGS')
  .requiredOption('-e, --environment <environment>', 'VGS environment, might be "dev", "sandbox"')
  .action((cmd) => {
    vgsCli.runAuth(cmd.environment);
    console.log(require('fs').readFileSync('./vgs-ascii').toString());
  });

program.parse(process.argv);
