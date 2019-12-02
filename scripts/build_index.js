const fs = require('fs');
const jsyaml = require('js-yaml');
var ncp = require('ncp').ncp;

const integrationsPath = './integrations';
const distDir = './dist';

run();

async function run() {
  await copyIntegrations(distDir);
  const index = buildIndex(`${distDir}/${integrationsPath}`);
  fs.writeFileSync(`${toDir}/index.json`, JSON.stringify(index));  
}

async function buildIndex(path) {
  const integrations = [];
  const dirs = fs.readdirSync(path);
  dirs.forEach(dir => {
    const intDir = `${path}/${dir}`;  
    const versionDir = fs.readdirSync(intDir).find(p => fs.lstatSync(`${intDir}/${p}`).isDirectory());
    const logoFile = fs.readdirSync(intDir).find(p => p.includes('logo'));

    const dump = fs.readFileSync(`${intDir}/${versionDir}/dump.yaml`).toString();

    integrations.push({
      logoFile,
      name: dir,
      config: 'config.json',
      readme: 'README.md',
      versions: [
        {
          version: versionDir,
          files: fs.readdirSync(`${intDir}/${versionDir}`)
        }
      ]
    });

    return integrations;
    // const routes = jsyaml.safeLoad(dump);
    // routes.data.forEach(route => {
    //   if(route.attributes.destination_override_endpoint === '*') {
    //     if(!route.attributes.tags.integration) {
    //       throw new Error(`${dir} integration should have tags.integration field`);
    //     }
    //   }

    //   if(!route.attributes.tags.name) {
    //     throw new Error(`${dir}/${versionDir} integration should have tags.name field`);
    //   }
    // });

    
  }); 
}

async function copyIntegrations(toDir) {
  return new Promise((resolve, rejeect) => {
    if(!fs.existsSync(toDir)){
      fs.mkdirSync(toDir);
    }
    
    ncp(integrationsPath, toDir, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

}
console.log(JSON.stringify(integrations, null, 2));
