const { exec } = require('child_process');
const cmn = require('./common');
const { logError } = require('./log');
const util = require('util');
const async_exec = util.promisify(require('child_process').exec);
const promptly = require('promptly');

const async_runDump = async () => {
	try {
		const creds = cmn.getCredentials();
		if (!creds.tennantId) {
			logError('Can\'t find tennantId, aborting');
			process.exit();
		}
		const cmd = `vgs --environment=dev --tenant=${creds.tennantId} route --dump-all > stuff/dump.yaml`;
		console.log(cmd);
		const { error, stdout, stderr } = await async_exec(cmd);

		if (error) {
			logError('Failed to run dump \n', error);
			if (await promptly.confirm('Retry?(y/n):')) {
				await async_runDump();
			} else {
				process.exit();
			}
		}

		/*
    if (stderr) {
			logError('Stderr during run dump \n', stderr);
		} else {
			console.log('Success!');
		}
    */
	} catch (error) {
		logError('Failed to run dump \n', error);
		if (await promptly.confirm('Retry?(y/n):')) {
			await async_runDump();
		} else {
			process.exit();
		}
	}
};

const runDump = async () => {
	const creds = cmn.getCredentials();
	if (!creds.tennantId) {
		logError('Can\'t find tennantId, aborting');
		process.exit();
	}
	const cmd = `vgs --environment=dev --tenant=${creds.tennantId} route --dump-all > stuff/dump.yaml`;
	console.log(cmd);
	exec(cmd, async (error, stdout, stderr) => {
		if (error) {
			logError('Failed to run dump \n', error);
			if (await promptly.confirm('Retry?(y/n):')) {
				runDump();
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

const runSync = async (tplsDumpPath) => {
	const creds = cmn.getCredentials();
	if (!creds.tennantId) {
		logError('Can\'t find tennantId, aborting');
		process.exit();
	}
	const cmd = `vgs --environment=dev --tenant=${creds.tennantId} route --sync-all < ${tplsDumpPath}`;
	console.log(cmd)

	exec(cmd, async (err, stdout, stderr) => {
		if (err) {
			logError('Failed to run sync \n', err, stderr);
			if (await promptly.confirm('Retry?(y/n):')) {
				runSync(tplsDumpPath);
			} else {
				process.exit();
			}
		}

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
	exec(`vgs ${env && '--environment='+env} authenticate`, async (error, stdout, stderr) => {
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
