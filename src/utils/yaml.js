const fs = require('fs');
const jsyaml = require('js-yaml');
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

const parsePerfectCase = (dump, requestedIntegration, requestedIntegrationVersion) => {
  const tplsDumpPath = `integrations/${requestedIntegration}/${requestedIntegrationVersion}/dump.yaml`;

  const tplDump = jsyaml.safeLoad(
    fs.readFileSync(`${process.env.PWD}/${tplsDumpPath}`, 'utf8')
  );

  const diff = deepDiff(dump, tplDump);
  if (!diff) {
    console.log('Yaml files are same');
    return;
  } else {
    const parsedDump = parseYamlDump(dump, tplDump);
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

const parseYamlDump = (dump, tplDump) => {
  // TODO add possibility to choose routes to sync by id
  const result = {
    inbound: false,
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
      if (result.inbound && result.inbound.id === route.id) {
        result.inbound = route; // TODO show diff & ask to rewrite
      } else {
        // route id same as tpl, just rewrite
        result.inbound = {
          ...route,
          id: result.inbound.id,
          attributes: {
            ...route.attributes,
            id: result.inbound.id,
          }
        };
      }
    } else {
      if (result.outbound[route.id]) {
        result.outbound[route.id] = route; // route id same as tpl, just rewrite
      } else {
        // TODO show diff & ask to rewrite
        result.outbound[route.id] = route;
      }
    }
  })

  // convert result -> array -> yaml dump
  result.inbound && alt_result.data.push(result.inbound);
  for (let route in result.outbound) {
    if (result.outbound.hasOwnProperty(route)) alt_result.data.push(result.outbound[route]);
  }

  return jsyaml.safeDump(alt_result);
}

module.exports = {
  getYamlFile,
}
