const vgsCli = require('./utils/vgs-cli');
const yamlUtil = require('./utils/yaml');
const cmn = require('./utils/common');

const tryToRun = (integrationList, requestedIntegration, requestedIntegrationVersion) => {
  const creds = cmn.getCredentials();
  if (!cmn.checkIntegrationAndVersion(requestedIntegration, requestedIntegrationVersion)) return;

  if (requestedIntegration && requestedIntegrationVersion) {
    console.log('perform run test for ', requestedIntegration, requestedIntegrationVersion);
    process.env.username = creds.username;
    process.env.password = creds.password;
    process.env.tennantId = creds.tennantId;

    const requestedTest = require(integrationList[requestedIntegration].versions[requestedIntegrationVersion].path + '/test');

    requestedTest();
  }
}

const runDumpAndSync = (requestedIntegration, requestedIntegrationVersion) => {
  if (!cmn.checkIntegrationAndVersion(requestedIntegration, requestedIntegrationVersion)) return;

  vgsCli.runDump(yamlUtil.getYamlFile(requestedIntegration, requestedIntegrationVersion));
};

module.exports = {
  tryToRun,
  runDumpAndSync,
}
