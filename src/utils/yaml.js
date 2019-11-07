const fs = require('fs');
const jsyaml = require('js-yaml');
const promptly = require('promptly');
const deepDiff = require('deep-diff').diff;
const vgsCli = require('./vgs-cli');
const cmn = require('./common');

const getYamlFile = (requestedIntegration, requestedIntegrationVersion) => {
  try {
    const dumpFile = fs.readFileSync(process.env.PWD+'/stuff/dump.yaml', 'utf8');
    const dump = jsyaml.safeLoad(dumpFile);
    parsePerfectCase(dump, requestedIntegration, requestedIntegrationVersion);
  } catch (e) {
    console.log(e);
  }
}

const parsePerfectCase = async (dump, requestedIntegration, requestedIntegrationVersion) => {
  const tplsDumpPath = `integrations/${requestedIntegration}/${requestedIntegrationVersion}/dump.yaml`;

  const tplDump = jsyaml.safeLoad(
    fs.readFileSync(`${process.env.PWD}/${tplsDumpPath}`, 'utf8')
  );

  const diff = deepDiff(dump, tplDump);
  if (!diff) {
    console.log('Yaml files are same');
    return;
  } else {
    const parsedDump = await parseYamlDump(dump, tplDump);
    if (!parsedDump) {
      console.log('parsed dump not valid, aborting');
      return;
    }
    fs.writeFileSync(
      `${process.env.PWD}/stuff/modified_dump.yaml`,
      parsedDump,
      { encoding: 'utf8' },
    );
    console.log(diff);
    vgsCli.runSync(`stuff/modified_dump.yaml`);
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
    console.log('dump is empty, aborting');
    return;
  }
  const alt_result = {
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
  result.inbound && alt_result.data.push(result.inbound);
  for (let route in result.outbound) {
    if (result.outbound.hasOwnProperty(route)) alt_result.data.push(result.outbound[route]);
  }

  if (result.dumpInbound || result.inbound) {
    alt_result.data.push(await inboundWorker(result.dumpInbound, result.inbound));
  }
  
  return jsyaml.safeDump(alt_result);
}

const inboundWorker = async (dumpRoute, tplInbound) => {
  if (tplInbound && tplInbound.id !== dumpRoute.id) {
    // route id differs from tpl id, show diff & ask rewrite
    const shouldRewrite = await promptly.confirm('You already have inbound route, rewrite?:');
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
  getYamlFile,
}
