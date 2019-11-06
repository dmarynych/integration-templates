var ncp = require('ncp').ncp;
const fs = require('fs'); 


module.exports = (name, version, program) => {
  console.log('creating new integration', name, version);

  const mainDir = `integrations/${name}`;
  const versionDir = `integrations/${name}/${version}`;

  const isMainExists = fs.existsSync(mainDir);
  const isVersionExists = fs.existsSync(versionDir);

  if (!isMainExists) {
    copyNew(name, version);
  }

  if (!isVersionExists) {
    copyVersion(name, version);
  }
}

function copyNew(name) {

}

function copyVersion(name, version) {
  const source = `templates/version`;
  const destination = `integrations/${name}/${version}`;

  ncp(source, destination, function (err) {
    if (err) {
      return console.error(err);
    }
    console.log(`Integration {name} is created! Go to ${destination} folder and check it.`);
  });
}
