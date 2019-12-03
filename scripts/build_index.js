const fs = require('fs');
const rimraf = require('rimraf');
var ncp = require('ncp').ncp;

const integrationsPath = 'integrations';
const distDir = './dist';

run();

async function run() {
  rimraf.sync(distDir);

  await copyIntegrations(distDir);
  const index = buildIndex(`${distDir}`);
  fs.writeFileSync(`${distDir}/index.json`, JSON.stringify(index)); 

  // console.log(JSON.stringify(index, null, 2)); 
}

function buildIndex(path) {
  const integrations = [];
  const dirs = fs.readdirSync(path);
  
  dirs.forEach(dir => {
    const intDir = `${path}/${dir}`;  
    
    if(!fs.lstatSync(intDir).isDirectory()) {
      return;
    }

    const versionDir = fs.readdirSync(intDir).find(p => fs.lstatSync(`${intDir}/${p}`).isDirectory());
    const logoFile = fs.readdirSync(intDir).find(p => p.includes('logo'));

    if(process.env.NODE_ENV === 'development') {
      let dump = fs.readFileSync(`${intDir}/${versionDir}/dump.yaml`).toString();
      dump = dump.replace('(.*)\\.verygoodproxy\\.com', '(.*)\\.verygoodproxy\\.io');
      fs.writeFileSync(`${intDir}/${versionDir}/dump.yaml`, dump);
    }

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

  return integrations;
}

async function copyIntegrations(toDir) {
  return new Promise((resolve, rejeect) => {
    if(!fs.existsSync(toDir)){
      fs.mkdirSync(toDir);
    }

    fs.copyFileSync('./src/utils/test-runner.js', `${toDir}/test-runner.js`);

    ncp(integrationsPath, toDir, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

}
