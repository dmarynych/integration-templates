const fs = require('fs');
const jsyaml = require('js-yaml');
const deepDiff = require('deep-diff').diff;
const vgsCli = require('./vgs-cli');

const getYamlFile = (requestedIntegration, requestedIntegrationVersion) => {
  try {
    var dump = jsyaml.safeLoad(fs.readFileSync(process.env.PWD+'/stuff/dump.yaml', 'utf8'));
    parsePerfectCase(dump, requestedIntegration, requestedIntegrationVersion);
  } catch (e) {
    console.log(e);
  }
}

const parsePerfectCase = (dump, requestedIntegration, requestedIntegrationVersion) => {
  const tplsDumpPath = `integrations/${requestedIntegration}/${requestedIntegrationVersion}/dump.yaml`;

  const tplDump = jsyaml.safeLoad(
    fs.readFileSync(`${process.env.PWD}/${tplsDumpPath}`, 'utf8')
  );
  console.log(tplDump, ' tplDump')

  const diff = deepDiff(dump, tplDump);
  if (!diff) {
    console.log('Yaml files are same');
    return;
  } else {
    console.log(diff, tplsDumpPath);
    vgsCli.runSync(tplsDumpPath);
  }
}

// TODO
// add possibility to choose routes to sync by id

module.exports = {
  getYamlFile,
}
