var ncp = require('ncp').ncp;
const fs = require('fs'); 


module.exports = async (name, version, program) => {
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
  }
}

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
