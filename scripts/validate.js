const fs = require('fs');
const jsyaml = require('js-yaml');
const assert = require('assert');

const integrationsPath = './integrations';
const dirs = fs.readdirSync(integrationsPath);

dirs.forEach(dir => {
  const intDir = `${integrationsPath}/${dir}`;  
  const versionDir = fs.readdirSync(intDir).find(p => fs.lstatSync(`${intDir}/${p}`).isDirectory());
  
  const dump = fs.readFileSync(`${intDir}/${versionDir}/dump.yaml`).toString();
  const routes = jsyaml.safeLoad(dump);
  routes.data.forEach(route => {
    if(route.attributes.destination_override_endpoint === '*') {
      if(!route.attributes.tags.integration) {
        throw new Error(`${dir} integration should have tags.integration field`);
      }
    }

    if(!route.attributes.tags.name) {
      throw new Error(`${dir}/${versionDir} integration should have tags.name field`);
    }
  });
});
