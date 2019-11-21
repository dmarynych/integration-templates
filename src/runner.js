const vgsCli = require('./utils/vgs-cli');
const yamlUtil = require('./utils/yaml');
const cmn = require('./utils/common');
const testRunner = require('./utils/test-runner'); /* should be here for test-runner */

const tryToRun = (requestedIntegration, requestedIntegrationVersion) => {
  const creds = cmn.getCredentials();
  if (!cmn.checkIntegrationAndVersion(requestedIntegration, requestedIntegrationVersion)) return;

  if (requestedIntegration && requestedIntegrationVersion) {
    const integrationList = cmn.getIntegrationList();
    console.log('perform run test for ', requestedIntegration, requestedIntegrationVersion);
    process.env.vgs_username = creds.username;
    process.env.vgs_password = creds.password;
    process.env.tennantId = creds.tennantId;

    // get config file and pass inners to process.env
    cmn.getConfig(requestedIntegration, requestedIntegrationVersion);

    require(`${integrationList[requestedIntegration].versions[requestedIntegrationVersion].path}/test`);
  }
};

const runDumpAndSync = async (requestedIntegration, requestedIntegrationVersion, env) => {
  cmn.clearDumpFiles();
  if (!cmn.checkIntegrationAndVersion(requestedIntegration, requestedIntegrationVersion)) return;
  await vgsCli.async_runDump(env);
  yamlUtil.dealWithYamlDumps(requestedIntegration, requestedIntegrationVersion, env);
};

module.exports = {
  tryToRun,
  runDumpAndSync,
};
