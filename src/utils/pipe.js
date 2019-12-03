const fs = require('fs');
const prettier = require('prettier');
const promptly = require('promptly');
const cmn = require('./common');
const log = require('./log');

const replaceLabel = 'replaced:';
const replaceMark = (path) => `${replaceLabel}${path}`;
const replaceRegexp = new RegExp(/[\r\n]/g);

const operationsTypesMapping = {
  'type.googleapis.com/JavascriptOperationConfig': {
    valueField: 'script',
    valueFileExt: 'js',
  },
};

const createPipelineFolders = (requestedIntegration, requestedIntegrationVersion) => {
  const routeDir = `${cmn.integrationRootDir + requestedIntegration}/${requestedIntegrationVersion}/replacers`;
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir);
  }
};

const extractOperationParam = (operation, idx, dir) => {
  const type = operation['@type'];
  const mappedLink = operationsTypesMapping[type];

  if (!mappedLink) { return false; }

  const value = operation[mappedLink.valueField];

  if (value.startsWith && value.startsWith(replaceLabel)) { return false; }

  fs.writeFileSync(
    `${dir}/${idx}-${type.split('/')[1]}.${mappedLink.valueFileExt}`,
    prettier.format(value, { parser: 'babel', singleQuote: true }),
    { encoding: 'utf8' },
  );

  return [value, replaceMark(`${idx}-${type.split('/')[1]}.${mappedLink.valueFileExt}`)];
};

const extractOperations = (requestedIntegration, requestedIntegrationVersion, dump) => {
  const dir = `${cmn.integrationRootDir + requestedIntegration}/${requestedIntegrationVersion}/replacers`;

  dump.data.map((route, rIdx) => {
    route.attributes.entries.map((entry, eIdx) => {
      // eslint-disable-next-line no-eval
      const operations = eval(entry.operations.replace(replaceRegexp, ' '));

      operations.forEach((operation, oIdx) => {
        const extractKeys = extractOperationParam(operation, `${rIdx}${eIdx}${oIdx}`, dir);
        if (extractKeys) {
          entry.operations = entry.operations.replace(...extractKeys);
        }
      });
      return entry;
    });
    return route;
  });

  return dump;
};

const insertOperationParam = async (operation, dir) => {
  // TODO currently only one field in operation can be replaced, remove this restriction
  let keys = false;
  let errors = [];

  Object.keys(operation).forEach(async (param) => {
    if (!operation[param].startsWith || !operation[param].startsWith(replaceLabel)) {
      return false;
    }

    const field = operation[param];
    try {
      const replacerFilePath = `${dir}/${field.replace(replaceLabel, '')}`;
      if (fs.existsSync(replacerFilePath)) {
        let value = fs.readFileSync(replacerFilePath, 'utf8');

        // TODO add syntax check for other types
        if (replacerFilePath.split('.')[replacerFilePath.split('.').length - 1] === 'js') {
          try {
            eval(value);
          } catch (e) {
            errors.push(`Smth went wrong with ${field.replace(replaceLabel, '')}\n ${e}`);
          }
        }
        value = value.replace(replaceRegexp, ' ');

        keys = [operation[param], value];
      } else {
        errors.push(`Couldn't find replacer file: ${replacerFilePath}`);
      }
    } catch (e) {
      log.logError(e);
    }
  });

  return { keys, errors };
};

const gatherOperations = async (requestedIntegration, requestedIntegrationVersion, dump) => {
  const dir = `${cmn.integrationRootDir + requestedIntegration}/${requestedIntegrationVersion}/replacers`;
  let errorsList = [];

  for (let r = 0; r < dump.data.length; r++) {
    let route = dump.data[r];
    for (let e = 0; e < route.attributes.entries.length; e++) {
      let entry = route.attributes.entries[e];
      if (entry.operations && entry.operations.includes(replaceLabel)) {
        // eslint-disable-next-line no-eval
        const operations = eval(entry.operations);

        for (let i = 0; i < operations.length; i++) {
          const { keys, errors } = await insertOperationParam(operations[i], dir);
          if (errors.length) {
            errors.forEach(e => errorsList.push(e));
          }
          if (keys) {
            entry.operations = entry.operations.replace(...keys);
          }
        }
      }
    }
  }

  if (errorsList.length) {
    errorsList.forEach((e) => log.logError(`${e}\n${log.logSeparator}`));
    if (await promptly.confirm('Abort?(y/n):')) {
      process.exit();
    }
  }

  return dump;
};

module.exports = {
  createPipelineFolders,
  extractOperations,
  gatherOperations,
};
