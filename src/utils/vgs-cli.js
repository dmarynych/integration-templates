const { exec } = require('child_process');
const util = require('util');
const async_exec = util.promisify(require('child_process').exec);
const promptly = require('promptly');
const { logError } = require('./log');
const cmn = require('./common');
const { spawnSync } = require('child_process');

const async_runDump = async (env) => {
  const creds = cmn.getCredentials();
  if (!creds.tennantId) {
    logError('Can\'t find tennantId, aborting');
    process.exit();
  }

  const cmd = `--environment=${env} --tenant=${creds.tennantId} route --dump-all > stuff/dump.yaml`;

  const p = spawnSync('vgs', [cmd], { shell: true });

  if (p.stderr) {
    const error = p.stderr.toString();
    if (error.includes('Authentication error')) {
      console.error(`Auth error. Run "./tool auth --environment ${env}" to authenticate`);
    } else {
      console.error(error);
    }

    if (error) process.exit();
  }

  if (p.stdout) {
    console.log(`log: ${p.stdout}`);
  }
};

const runDump = async (env) => {
  const creds = cmn.getCredentials();
  if (!creds.tennantId) {
    logError('Can\'t find tennantId, aborting');
    process.exit();
  }
  const cmd = `vgs --environment=${env} --tenant=${creds.tennantId} route --dump-all > stuff/dump.yaml`;
  console.log(cmd);
  exec(cmd, async (error, stdout, stderr) => {
    if (error) {
      logError('Failed to run dump \n', error);
      if (await promptly.confirm('Retry?(y/n):')) {
        runDump(env);
      } else {
        process.exit();
      }
    }

    /*
    if(stderr) {
			console.log('Failed to run dump \n', stderr);
		} else {
			console.log('Success!');
		}
    */
  });
};

const runSync = async (tplsDumpPath, env, requestedIntegration, requestedIntegrationVersion) => {
  const creds = cmn.getCredentials();
  if (!creds.tennantId) {
    logError('Can\'t find tennantId, aborting');
    process.exit();
  }
  const cmd = `vgs --environment=${env} --tenant=${creds.tennantId} route --sync-all < ${tplsDumpPath}`;
  console.log(cmd);

  exec(cmd, async (err, stdout, stderr) => {
    if (err) {
      logError('Failed to run sync \n', err, stderr);
      if (await promptly.confirm('Retry?(y/n):')) {
        runSync(tplsDumpPath, env, requestedIntegration, requestedIntegrationVersion);
      } else {
        process.exit();
      }
    }

    console.log(' \nSuccess! Now try to run test for this integration if it is ready');
    console.log(`./tool test ${requestedIntegration} ${requestedIntegrationVersion} -e ${env}`);

    /*
    if (stderr) {
			logError('Stderr during run sync \n', stderr);
		} else {
			console.log('Success!');
    }
    */
  });
};

const runAuth = async (env) => {
  exec(`vgs ${env && `--environment=${env}`} authenticate`, async (error, stdout, stderr) => {
    if (error) {
      logError('Failed to run auth \n', error);
      if (await promptly.confirm('Retry?(y/n):')) {
        runAuth(env);
      } else {
        process.exit();
      }
    }

    /*
    if(stderr) {
			logError('Failed to run auth \n', stderr);
		} else {
			console.log('Success!');
		}
    */
  });
};

module.exports = {
  runDump,
  runSync,
  runAuth,
  async_runDump,
};
