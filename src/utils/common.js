const path = require('path');
const fs = require('fs');
const jsyaml = require('js-yaml');
const promptly = require('promptly');
const log = require('./log');

const integrationRootDir = `${process.env.PWD}/integrations/`;
const credsRootDir = `${process.env.PWD}/credentials/`;

const getProxyType = (route) => route.destination_override_endpoint !== '*' ? 'inbound' : 'outbound';

const getIntegrationDump = (requestedIntegration, requestedIntegrationVersion) => {
  const dump = jsyaml.safeLoad(
    fs.readFileSync(`${integrationRootDir + requestedIntegration}/${requestedIntegrationVersion}/dump.yaml`),
  );
  return dump;
};

const replaceHostToDev = (host) => {
  if (host.includes('verygoodproxy') && host.includes('.com')) {
    return host.replace('.com', '.io');
  }

  return host;
};

const rewriteDump = (requestedIntegration, requestedIntegrationVersion, dump) => {
  const yaml = jsyaml.safeDump(dump);
  fs.writeFileSync(
    `${integrationRootDir + requestedIntegration}/${requestedIntegrationVersion}/dump.yaml`,
    yaml,
    { encoding: 'utf8' },
  );
};

const getIntegrationVersions = (integrationName) => {
  const vList = {};
  fs.readdirSync(integrationRootDir + integrationName, { withFileTypes: true })
    .forEach((i) => {
      if (i.isDirectory()) {
        vList[i.name] = { v: i.name, path: `${integrationRootDir + integrationName}/${i.name}` };
      }
    });

  return vList;
};

const getIntegrationList = () => {
  const integrationList = {};

  fs.readdirSync(integrationRootDir, { withFileTypes: true })
    .forEach((i) => {
      if (i.isDirectory()) {
        integrationList[i.name] = { name: i.name, versions: getIntegrationVersions(i.name) };
      }
    });

  return integrationList;
};

const checkIntegrationAndVersion = (requestedIntegration, requestedIntegrationVersion) => {
  const integrationList = getIntegrationList();

  if (!Object.keys(integrationList).includes(requestedIntegration)) {
    console.log('wrong integration name');
    console.log(Object.keys(integrationList));
    return false;
  }
  if (requestedIntegration && !requestedIntegrationVersion
    || !Object.keys(integrationList[requestedIntegration].versions).includes(requestedIntegrationVersion)
  ) {
    console.log('version required');
    console.log(Object.keys(integrationList[requestedIntegration].versions));
    return false;
  }

  return true;
};

const clearDumpFiles = () => {
  fs.writeFileSync(
    `${process.env.PWD}/stuff/modified_dump.yaml`,
    '',
    { encoding: 'utf8' },
  );
  fs.writeFileSync(
    `${process.env.PWD}/stuff/dump.yaml`,
    '',
    { encoding: 'utf8' },
  );
};

const getConfig = async (requestedIntegration) => {
  const config = JSON.parse(fs.readFileSync(`${integrationRootDir}${requestedIntegration}/config.json`));
  for (const variable in config.params) {
    if (config.params.hasOwnProperty(variable)) {
      process.env[variable] = config.params[variable];
      if (!config.params[variable]) {
        console.log(`${variable} field is empty`);
        process.env[variable] = await promptly
          .prompt(`input below, or fill integrations/${requestedIntegration}/config.json and rerun\n`);
      }
    }
  }
};

const setCredentials = () => {
  const credsList = [];
  fs.readdirSync(credsRootDir, { withFileTypes: true })
    .filter((f) => f.name.includes('credentials_'))
    .forEach((f) => credsList.push(f));
  if (!credsList.length) { console.log('can\'t find credentials file, paste it to /credentials'); return; }
  console.log('taking credentials from ', credsList[0].name);
  const creds = fs.readFileSync(`${credsRootDir}/${credsList[0].name}`, 'utf8');
  const credsConfig = {
    username: creds.split('"')[1],
    password: creds.split('"')[3],
    tennantId: credsList[0].name.split('_')[1].split('.')[0],
  };
  console.log(credsConfig);
  fs.writeFileSync(`${credsRootDir}/creds.json`, JSON.stringify(credsConfig), { encoding: 'utf8' });
};

function getCredentials() {
  const crdsFile = fs.readFileSync(`${credsRootDir}/creds.json`, { encoding: 'utf8' });
  if (!crdsFile) { console.log('credentials and tenantId are missing, run set-creds'); return; }
  const crds = JSON.parse(crdsFile);

  if (!crds.username || !crds.password || !crds.tennantId) {
    log.logError('Credentials not valid, please fill vault credentials to /credentails/creds.json');
    process.exit();
  }

  return crds;
}

// TODO set creds for tennant, check is there creds file with input tennant

module.exports = {
  integrationRootDir,
  getIntegrationDump,
  rewriteDump,
  replaceHostToDev,
  getIntegrationList,
  getProxyType,
  checkIntegrationAndVersion,
  clearDumpFiles,
  getConfig,
  setCredentials,
  getCredentials,
};
