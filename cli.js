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
  .option('-o, --operation-pipeline', 'Integration with operations pipeline example')
  .description('Create a new template. For example "new visa v1" to kickstart new integration')
  .action((name, version = 'default', cmd) => {
    newCommand(name, version, cmd.operationPipeline);
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
  .description('Apply integration. For example "apply visa v1 -e sandbox" to save routes')
  .requiredOption('-e, --environment <environment>', 'VGS environment, might be "dev", "sandbox"')
  .action((name, version = 'default', cmd) => {
    runner.runDumpAndSync(name, version, cmd.environment);
  });

program
  .command('test <name> [version]')
  .description('Test integration. For example "test visa v1 -e sandbox" to test if it works')
  .requiredOption('-e, --environment <environment>', 'VGS environment, might be "dev", "sandbox"')
  .action((name, version = 'default', cmd) => {
    runner.runTest(name, version, cmd.environment);
  });

program
  .command('dump')
  .description('Dump routes, using creds file "credentials/creds.json"')
  .requiredOption('-e, --environment <environment>', 'VGS environment, might be "dev", "sandbox"')
  .action((cmd) => {
    vgsCli.async_runDump(cmd.environment, cmd.current);
  });

program
  .command('auth')
  .description('Auth on VGS')
  .option('-e, --environment <environment>', 'VGS environment, might be "dev", "sandbox"')
  .action(({ environment = 'sandbox' }) => {
    vgsCli.runAuth(environment);
    console.log(require('fs').readFileSync('./vgs-ascii').toString());
  });

program
  .command('split <name> [version]')
  .description('Split integration. For example "split visa v1" to split operations from yaml')
  .action((name, version = 'default') => {
    runner.splitPipeline(name, version);
  });

program
  .command('pack <name> [version]')
  .description('Pack integration. For example "pack visa v1" to pack operations to yaml')
  .action((name, version = 'default') => {
    runner.gatherPipeline(name, version, true);
  });

program.parse(process.argv);
