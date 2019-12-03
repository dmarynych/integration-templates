const fs = require('fs');
const _ = require('lodash');
const jsyaml = require('js-yaml');
const promptly = require('promptly');
const vgsCli = require('./vgs-cli');
const cmn = require('./common');
const log = require('./log');

const inboundWorker = async (dump, tpl) => {
  if (!_.isEmpty(dump) && _.get(tpl, 'id') !== dump.id) {
    // route id differs from tpl id, show diff & ask rewrite
    const shouldRewrite = tpl.destination_override_endpoint !== dump.destination_override_endpoint
      ? await promptly.confirm('You already have inbound route, rewrite?(y/n):')
      : true;
    if (!_.isEmpty(tpl) && shouldRewrite) {
      tpl.id = dump.id;
      tpl.attributes.id = dump.id;
      return tpl;
    }
    return dump;
  }
  return tpl;
};

const combine = async (dump, tpl, env) => {
  if (!dump) {
    log.logError('dump is empty, aborting');
    process.exit();
  }

  const combined = {
    dump: { in: {}, out: {} },
    tpl: { in: {}, out: {} },
    result: { in: {}, out: {} },
    packed: { data: [], version: dump.version },
  };

  tpl.data.forEach((route) => {
    if (cmn.getProxyType(route.attributes) === 'inbound') {
      if (env === 'dev') {
        route.attributes.host_endpoint = cmn.replaceHostToDev(route.attributes.host_endpoint);
      }
      combined.tpl.in = route;
    } else {
      combined.tpl.out[route.id] = route;
    }
  });

  dump.data.forEach((route) => {
    if (cmn.getProxyType(route.attributes) === 'inbound') {
      combined.dump.in = route;
    } else {
      combined.dump.out[route.id] = route;
    }
  });

  if (combined.dump.in.id || combined.tpl.in.id) {
    combined.result.in = await inboundWorker(combined.dump.in, combined.tpl.in);
  }

  for (const route in combined.dump.out) {
    if (combined.dump.out.hasOwnProperty(route)) {
      combined.result.out[route] = combined.dump.out[route];
    }
  }
  for (const route in combined.tpl.out) {
    if (combined.tpl.out.hasOwnProperty(route)) {
      combined.result.out[route] = combined.tpl.out[route];
    }
  }

  // pack all together
  if (!_.isEmpty(combined.result.in)) {
    combined.packed.data.push(combined.result.in);
  }
  for (const route in combined.result.out) {
    if (combined.result.out.hasOwnProperty(route)) {
      combined.packed.data.push(combined.result.out[route]);
    }
  }

  return combined;
};

const dealWithYamlDumps = async (requestedIntegration, requestedIntegrationVersion, options) => {
  const { env } = options;
  let { tplDump } = options;
  try {
    const dumpFile = fs.readFileSync(`${process.env.PWD}/stuff/dump.yaml`, 'utf8');
    const dump = jsyaml.safeLoad(dumpFile);
    const tplsDumpPath = `integrations/${requestedIntegration}/${requestedIntegrationVersion}/dump.yaml`;

    if (!tplDump) {
      try {
        tplDump = jsyaml.safeLoad(
          fs.readFileSync(`${process.env.PWD}/${tplsDumpPath}`, 'utf8'),
        );
      } catch (e) {
        log.logError('Failed to get template routes dump');
        return;
      }
    }

    const combined = await combine(dump, tplDump, env);
    let parsedDump;

    try {
      parsedDump = jsyaml.safeDump(combined.packed);
    } catch (e) {
      log.logError('Parsed dump not valid, aborting \n', e);
      process.exit();
    }

    try {
      fs.writeFileSync(
        `${process.env.PWD}/stuff/modified_dump.yaml`,
        parsedDump,
        { encoding: 'utf8' },
      );
    } catch (e) {
      log.logError('Couldn\'t update dump file, aborting \n', e);
      process.exit();
    }

    log.showDiff(combined);

    if (await promptly.confirm(`You are going to update routes for ${log.colors.FgRed + cmn.getCredentials().tennantId + log.colors.FgDefault}. Are you sure about this?(y/n):`)) {
      vgsCli.runSync('stuff/modified_dump.yaml', env);
    }
  } catch (e) {
    log.logError(e);
  }
};

module.exports = {
  dealWithYamlDumps,
};
