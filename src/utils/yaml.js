const fs = require('fs');
const jsyaml = require('js-yaml');
const promptly = require('promptly');
const deepDiff = require('deep-diff').diff;
const vgsCli = require('./vgs-cli');
const cmn = require('./common');
const log = require('./log');

const dealWithYamlDumps = async (requestedIntegration, requestedIntegrationVersion) => {
  try {
    const dumpFile = fs.readFileSync(process.env.PWD+'/stuff/dump.yaml', 'utf8');
    const dump = jsyaml.safeLoad(dumpFile);
    const tplsDumpPath = `integrations/${requestedIntegration}/${requestedIntegrationVersion}/dump.yaml`;
    let tplDump;

    try {
      tplDump = jsyaml.safeLoad(
        fs.readFileSync(`${process.env.PWD}/${tplsDumpPath}`, 'utf8')
      );
    } catch (e) {
      log.logError('Failed to get template routes dump');
      return;
    }

    const diff = deepDiff(dump, tplDump);
    if (!diff) {
      console.log('Yaml files are same');
      return;
    } else {
      const combinedDump = await parseYamlDump(dump, tplDump);
      let parsedDump;

      try {
        parsedDump = jsyaml.safeDump(combinedDump);
      } catch (e) {
        log.logError(e);
      }

      if (!parsedDump) {
        log.logError('parsed dump not valid, aborting');
        return;
      }
      fs.writeFileSync(
        `${process.env.PWD}/stuff/modified_dump.yaml`,
        parsedDump,
        { encoding: 'utf8' },
      );
      log.showDumpDiff(diff, combinedDump);
      if (await promptly.confirm(`You are going to update routes for ${cmn.getCredentials().tennantId}. Are you sure about this?:`)) {
        vgsCli.runSync(`stuff/modified_dump.yaml`);
      }
    }
  } catch (e) {
    log.logError(e);
  }
}

const parseYamlDump = async (dump, tplDump) => {
  // TODO add possibility to choose routes to sync by id
  const result = {
    inbound: false,
    dumpInbound: false,
    outbound: {
      // id: route
    },
  };
  if (!dump) {
    log.logError('dump is empty, aborting');
    return;
  }
  const combinedDump = {
    data: [],
    version: dump.version,
  }

  tplDump.data.forEach(route => {
    if (cmn.getProxyType(route.attributes) === 'inbound') {
      result.inbound = route;
    } else {
      result.outbound[route.id] = route;
    }
  });
  
  dump.data.forEach(route => {
    isRoutesExists = true;
    if (cmn.getProxyType(route.attributes) === 'inbound') {
      result.dumpInbound = route;
    } else if (!result.outbound[route.id]) {
      result.outbound[route.id] = route;
    }
  });

  // convert result -> array -> yaml dump
  result.inbound && combinedDump.data.push(result.inbound);
  for (let route in result.outbound) {
    if (result.outbound.hasOwnProperty(route)) combinedDump.data.push(result.outbound[route]);
  }

  if (result.dumpInbound || result.inbound) {
    combinedDump.data.push(await inboundWorker(result.dumpInbound, result.inbound));
  }

  return combinedDump;
}

const inboundWorker = async (dumpRoute, tplInbound) => {
  if (tplInbound && dumpRoute && tplInbound.id !== dumpRoute.id) {
    // route id differs from tpl id, show diff & ask rewrite
    const shouldRewrite = await promptly.confirm('You already have inbound route, rewrite?(y/n):');
    if (shouldRewrite) {
      tplInbound.id = dumpRoute.id;
      tplInbound.attributes.id = dumpRoute.id;
      return tplInbound;
    }
  } else {
    return dumpRoute;
  }
}

module.exports = {
  dealWithYamlDumps,
}
