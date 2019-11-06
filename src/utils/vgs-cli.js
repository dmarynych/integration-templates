const { exec } = require('child_process');
const cmn = require('./common');

const runDump = (cb) => {
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
      console.log(`Route configs from ${creds.tennantId} saved to stuff/dump.yaml`);
    }
    if (cb) cb();
  });
}

const runSync = (tplsDumpPath, cb) => {
  const creds = cmn.getCredentials();
  exec(`vgs --environment=dev --tenant=${creds.tennantId} route --sync-all < ${tplsDumpPath}`, (err, stdout, stderr) => {
    if (err) {
      console.log('node couldn\'t execute the command', err);
      return;
    }

    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    if (cb) cb();
  });
}

const runAuth = (env) => {
  exec(`vgs ${env && '--environment='+env} authenticate`, (err, stdout, stderr) => {
    if (err) {
      console.log('node couldn\'t execute the command', err);
      return;
    }

    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
}

module.exports = {
  runDump,
  runSync,
  runAuth,
}
