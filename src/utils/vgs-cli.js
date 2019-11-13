const { exec } = require('child_process');
const cmn = require('./common');
const log = require('./log');
const util = require('util');
const async_exec = util.promisify(require('child_process').exec);
const promptly = require('promptly');

const async_runDump = async () => {
  try {
    const creds = cmn.getCredentials();
    const { error, stdout, stderr } = await async_exec(`vgs --environment=dev --tenant=${creds.tennantId} route --dump-all > stuff/dump.yaml`);

    if (error) {
      log.logError('Failed to run dump, ', error);
      if (await promptly.confirm(`Retry?:`)) {
        async_runDump();
      }
    }

    if(stderr) {
      console.log('error', stderr);
    } else {
      console.log('Success!', stdout);
    }
  } catch (error) {
    log.logError('Failed to run dump, ', error);
    if (await promptly.confirm(`Retry?:`)) {
      async_runDump();
    }
  }
}

const runDump = async () => {
  const creds = cmn.getCredentials();
  exec(`vgs --environment=dev --tenant=${creds.tennantId} route --dump-all > stuff/dump.yaml`, async (err, stdout, stderr) => {
    if (err) {
      log.logError('node couldn\'t execute the command');
      log.logError(err);
      if (await promptly.confirm(`Retry?:`)) {
        runDump();
      }
    }

    if(stderr) {
      console.log('error', stderr);
    } else {
      console.log('Success!');
    }
  });
}

const runSync = async (tplsDumpPath) => {
  const creds = cmn.getCredentials();
  const cmd = `vgs --environment=dev --tenant=${creds.tennantId} route --sync-all < ${tplsDumpPath}`;
  console.log(cmd);
  
  exec(cmd, async (err, stdout, stderr) => {
    if (err) {
      log.logError('node couldn\'t execute the command');
      log.logError(err);
      if (await promptly.confirm(`Retry?:`)) {
        runSync(tplsDumpPath);
      }
    }

    if(stderr) {
      console.log('error while synsing routes', stderr);
    } else {
      console.log('Success!');
    }
  });
}

const runAuth = async (env) => {
  exec(`vgs ${env && '--environment='+env} authenticate`, async (err, stdout, stderr) => {
    if (err) {
      log.logError('node couldn\'t execute the command');
      log.logError(err);
      if (await promptly.confirm(`Retry?:`)) {
        runAuth(env);
      }
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
