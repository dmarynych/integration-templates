const log = require('./src/utils/log');
const cmn = require('./src/utils/common');
const vgsCli = require('./src/utils/vgs-cli');
const runner = require('./src/runner');

const command = process.argv[2];
const requestedIntegration = process.argv[3];
const requestedIntegrationVersion = process.argv[4];

const integrationList = cmn.getIntegrationList();

switch (command) {
  case 'apply':
    runner.runDumpAndSync(requestedIntegration, requestedIntegrationVersion);
    return;
  case 'test':
    runner.tryToRun(integrationList, requestedIntegration, requestedIntegrationVersion);
    return;
  case 'auth':
    vgsCli.runAuth();
    return;
  case 'auth-dev':
    vgsCli.runAuth('dev');
    return;
  case 'set-creds':
    cmn.setCredentials();
    return;
  case 'show': 
    log.show(integrationList);
    return;
  case 'dump':
    vgsCli.runDump();
    return;
  default:
    console.log('wrong command');
    return;
}
