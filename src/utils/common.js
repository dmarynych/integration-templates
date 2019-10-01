const fs = require('fs');

const integrationRootDir = process.env.PWD+'/integrations/';
const credsRootDir = process.env.PWD+'/stuff/credentials/';

const getProxyType = (route) => route.destination_override_endpoint !== '*' ? 'inbound' : 'outbound';

const getIntegrationVersions = (integrationName, integrationRootDir) => {
  let vList = {};
  fs.readdirSync(integrationRootDir+integrationName, { withFileTypes: true })
    .forEach(i => {
      if (i.isDirectory()) {
        vList[i.name] = { v: i.name, path: integrationRootDir+integrationName+'/'+i.name };
      }
    });

  return vList;
}

const getIntegrationList = () => {
  const integrationList = {};
  
  fs.readdirSync(integrationRootDir, { withFileTypes: true })
    .forEach(i => {
      if (i.isDirectory()) {
        integrationList[i.name] = { name: i.name, versions: getIntegrationVersions(i.name, integrationRootDir) }
      }
    });
  
  return integrationList;
}

const checkIntegrationAndVersion = (requestedIntegration, requestedIntegrationVersion) => {
  const integrationList = getIntegrationList();

  if (!Object.keys(integrationList).includes(requestedIntegration)) {
    console.log('wrong integration name');
    console.log(Object.keys(integrationList));
    return false;
  }
  if (requestedIntegration && !requestedIntegrationVersion ||
    !Object.keys(integrationList[requestedIntegration].versions).includes(requestedIntegrationVersion)
  ) {
    console.log('version required');
    console.log(Object.keys(integrationList[requestedIntegration].versions));
    return false;
  }

  return true;
}

const setCredentials = () => {
  const credsList = [];
  fs.readdirSync(credsRootDir, { withFileTypes: true })
    .filter(f => f.name.includes('credentials_'))
    .forEach(f => credsList.push(f));
  if (!credsList.length) { console.log('can\'t find credentials file, paste it to /stuff/credentials'); return; }
  console.log('taking credentials from ', credsList[0].name)
  const creds = fs.readFileSync(`${credsRootDir}/${credsList[0].name}`, 'utf8');
  const credsConfig = {
    username: creds.split('"')[1],
    password: creds.split('"')[3],
    tennantId: credsList[0].name.split('_')[1].split('.')[0],
  };
  console.log(credsConfig);
  fs.writeFileSync(`${credsRootDir}/creds.json`, JSON.stringify(credsConfig), { encoding: 'utf8' });
}

function getCredentials () {
  const crdsFile = fs.readFileSync(`${credsRootDir}/creds.json`, { encoding: 'utf8' });
  if (!crdsFile) { console.log('credentials and tenantId are missing, run set-creds'); return; }
  return JSON.parse(crdsFile);
}

module.exports = {
  getIntegrationList,
  getProxyType,
  checkIntegrationAndVersion,
  setCredentials,
  getCredentials,
}
