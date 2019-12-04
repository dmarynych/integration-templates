const ncp = require('ncp').ncp;
const fs = require('fs');

module.exports = async (name, version, op = false) => {
  console.log('creating new integration', name, version);

  const mainDir = `integrations/${name}`;
  const versionDir = `integrations/${name}/${version}`;

  const isMainExists = fs.existsSync(mainDir);
  const isVersionExists = fs.existsSync(versionDir);

  if (!isMainExists) {
    await copyNew(name, version);
  }

  if (!isVersionExists) {
    await copyVersion(name, version);

    if (op) {
      const js = fs.readFileSync('./templates/js.js').toString();
      const ops = fs.readFileSync('./templates/pipeline.json').toString();

      let dump = fs.readFileSync('./templates/version/dump.yaml').toString();
      dump = dump.replace('operations: null', `operations: |-${ops}`);
      fs.writeFileSync(`./${versionDir}/dump.yaml`, dump);

      fs.mkdirSync(`./${versionDir}/replacers`);
      fs.writeFileSync(`./${versionDir}/replacers/operation.js`, js);
    }

    console.log(`\nSuccess! Now try to run test for this integration if it is ready
for example "./tool test ${name} ${version} -e "
# how to write tests: https://github.com/verygoodsecurity/integration-templates#writing-tests`);
  }
};

function copyNew(name) {
  const source = `templates/integration`;
  const destination = `integrations/${name}`;

  return new Promise((resolve, reject) => {
    ncp(source, destination, function (err) {
      if (err) {
        console.error(err);
        reject(err);
      }
      console.log(`Integration ${name} is created! Go to ${destination} folder and check it.`);
      resolve();
    });
  });
}

function copyVersion(name, version) {
  const source = `templates/version`;
  const destination = `integrations/${name}/${version}`;

  return new Promise((resolve, reject) => {
    ncp(source, destination, function (err) {
      if (err) {
        console.error(err);
          reject(err);
      }
      console.log(`Integration ${name}/${version} is created! Go to ${destination} folder and check it.`);
      resolve();
    });
  });
}
