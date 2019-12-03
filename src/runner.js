const vgsCli = require('./utils/vgs-cli');
const yamlUtil = require('./utils/yaml');
const cmn = require('./utils/common');
const pipe = require('./utils/pipe');
// eslint-disable-next-line no-unused-vars
const testRunner = require('./utils/test-runner'); /* should be here for test-runner */

const runTest = async (requestedIntegration, requestedIntegrationVersion) => {
  const creds = cmn.getCredentials();
  if (!cmn.checkIntegrationAndVersion(requestedIntegration, requestedIntegrationVersion)) return;

  if (requestedIntegration && requestedIntegrationVersion) {
    const integrationList = cmn.getIntegrationList();
    console.log('perform run test for ', requestedIntegration, requestedIntegrationVersion);
    process.env.vgs_username = creds.username;
    process.env.vgs_password = creds.password;
    process.env.tennantId = creds.tennantId;

    // get config file and pass inners to process.env
    await cmn.getConfig(requestedIntegration, requestedIntegrationVersion);

    require(`${integrationList[requestedIntegration].versions[requestedIntegrationVersion].path}/test`);
  }
};

const splitPipeline = async (requestedIntegration, requestedIntegrationVersion) => {
  if (!cmn.checkIntegrationAndVersion(requestedIntegration, requestedIntegrationVersion)) return;

  let dump = cmn.getIntegrationDump(requestedIntegration, requestedIntegrationVersion);

  pipe.createPipelineFolders(requestedIntegration, requestedIntegrationVersion);
  dump = pipe.extractOperations(requestedIntegration, requestedIntegrationVersion, dump);
  cmn.rewriteDump(requestedIntegration, requestedIntegrationVersion, dump);
};

const gatherPipeline = async (requestedIntegration, requestedIntegrationVersion, shouldRewrite) => {
  if (!cmn.checkIntegrationAndVersion(requestedIntegration, requestedIntegrationVersion)) return;

  let dump = cmn.getIntegrationDump(requestedIntegration, requestedIntegrationVersion);
  dump = await pipe.gatherOperations(requestedIntegration, requestedIntegrationVersion, dump);
  if (shouldRewrite) {
    await cmn.rewriteDump(requestedIntegration, requestedIntegrationVersion, dump);
  }

  return dump;
};

const runDumpAndSync = async (requestedIntegration, requestedIntegrationVersion, env) => {
  cmn.clearDumpFiles();
  if (!cmn.checkIntegrationAndVersion(requestedIntegration, requestedIntegrationVersion)) return;
  await vgsCli.async_runDump(env);
  const tplDump = await gatherPipeline(requestedIntegration, requestedIntegrationVersion);
  yamlUtil.dealWithYamlDumps(requestedIntegration, requestedIntegrationVersion, {
    env,
    tplDump,
  });
};

module.exports = {
  runTest,
  runDumpAndSync,
  splitPipeline,
  gatherPipeline,
};
