const fs = require('fs');
const jsyaml = require('js-yaml');
var ncp = require('ncp').ncp;

const integrationsPath = './integrations';
const dirs = fs.readdirSync(integrationsPath);

const integrations = [];

dirs.forEach(dir => {
  const intDir = `${integrationsPath}/${dir}`;  
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

const distDir = './dist';
if(!fs.existsSync(distDir)){
  fs.mkdirSync(distDir);
}

ncp(integrationsPath, distDir, function (err) {
  if (err) {
    console.error(err);
  }

  fs.writeFileSync(`${distDir}/index.json`, JSON.stringify(integrations));
});

console.log(JSON.stringify(integrations, null, 2));
