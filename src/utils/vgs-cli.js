const { exec } = require('child_process');
const cmn = require('./common');
const util = require('util');
const async_exec = util.promisify(require('child_process').exec);

const async_runDump = async () => {
  const creds = cmn.getCredentials();
  const { stdout, stderr } = await async_exec(`vgs --environment=dev --tenant=${creds.tennantId} route --dump-all > stuff/dump.yaml`);

  if(stderr) {
    console.log('error', stderr);
  } else {
    console.log('Success!');
  }
}

const runDump = () => {
  const creds = cmn.getCredentials();
  exec(`vgs --environment=dev --tenant=${creds.tennantId} route --dump-all > stuff/dump.yaml`, (err, stdout, stderr) => {
    if (err) {
      console.log('node couldn\'t execute the command', err);
      return;
    }

    if(stderr) {
      console.log('error', stderr);
    } else {
      console.log('Success!');
    }
  });
}

const runSync = (tplsDumpPath) => {
  const creds = cmn.getCredentials();
  const cmd = `vgs --environment=dev --tenant=${creds.tennantId} route --sync-all < ${tplsDumpPath}`;
  console.log(cmd);
  
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.log('node couldn\'t execute the command', err);
      return;
    }

    if(stderr) {
      console.log('error while synsing routes', stderr);
    } else {
      console.log('Success!');
    }
  });
}

const runAuth = (env) => {
  exec(`vgs ${env && '--environment='+env} authenticate`, (err, stdout, stderr) => {
    if (err) {
      console.log('node couldn\'t execute the command', err);
      return;
    }

    if(stderr) {
      console.log('error', stderr);
    } else {
      console.log('Success!');
    }
  });
}

module.exports = {
  runDump,
  runSync,
  runAuth,
  async_runDump,
}
