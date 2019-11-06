var ncp = require('ncp').ncp;
const fs = require('fs'); 


module.exports = (name, version, program) => {
  console.log('new', name, version);

  const mainDir = `integrations/${name}`;
  const versionDir = `integrations/${name}/${version}`;

  const isMainExists = fs.existsSync(mainDir);
  const isVersionExists = fs.existsSync(versionDir);

  if (!isMainExists) {
    console.log('creating new');
    copyNew(name, version);
  }

  if (!isVersionExists) {
    console.log('creating version');
    copyVersion(name, version);
  }
  console.log(mainDir, isMainExists, versionDir, isVersionExists);
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
    console.log('done!');
  });
}
