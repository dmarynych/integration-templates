const vgsCli = require('./utils/vgs-cli');
const yamlUtil = require('./utils/yaml');
const cmn = require('./utils/common');
const testRunner = require('./utils/test-runner');

const tryToRun = (requestedIntegration, requestedIntegrationVersion) => {
  const creds = cmn.getCredentials();
  if (!cmn.checkIntegrationAndVersion(requestedIntegration, requestedIntegrationVersion)) return;

  if (requestedIntegration && requestedIntegrationVersion) {
    const integrationList = cmn.getIntegrationList();
    console.log('perform run test for ', requestedIntegration, requestedIntegrationVersion);
    process.env.username = creds.username;
    process.env.password = creds.password;
    process.env.tennantId = creds.tennantId;

    // get config file and pass inners to process.env
    cmn.getConfig(requestedIntegration, requestedIntegrationVersion);

    const requestedTest = require(integrationList[requestedIntegration].versions[requestedIntegrationVersion].path + '/test');

    requestedTest();
  }
}

const runDumpAndSync = async (requestedIntegration, requestedIntegrationVersion) => {
  cmn.clearDumpFiles();
  if (!cmn.checkIntegrationAndVersion(requestedIntegration, requestedIntegrationVersion)) return;
  await vgsCli.async_runDump();
  yamlUtil.dealWithYamlDumps(requestedIntegration, requestedIntegrationVersion);
};

module.exports = {
  tryToRun,
  runDumpAndSync,
}
