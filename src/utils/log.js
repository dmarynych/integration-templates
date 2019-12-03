const _ = require('lodash');
const deepDiff = require('deep-diff').diff;

const diffLabels = {
  N: 'property/element added',
  D: 'property/element was deleted',
  E: 'property/element was edited',
  A: 'array changed',
};

const colors = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',

  FgDefault: '\x1b[39m',
  FgBlack: '\x1b[30m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  FgMagenta: '\x1b[35m',
  FgCyan: '\x1b[36m',
  FgWhite: '\x1b[37m',

  BgBlack: '\x1b[40m',
  BgRed: '\x1b[41m',
  BgGreen: '\x1b[42m',
  BgYellow: '\x1b[43m',
  BgBlue: '\x1b[44m',
  BgMagenta: '\x1b[45m',
  BgCyan: '\x1b[46m',
  BgWhite: '\x1b[47m',
};

const logSeparator = '-------------------';

const logError = (msg) => {
  console.log(colors.FgRed, msg, colors.FgDefault);
};

const show = (integrationList) => {
  console.log('Existing integrations:');
  console.log(logSeparator);
  for (const i in integrationList) {
    console.log(i);
    console.log(' versions:');
    for (const iv in integrationList[i].versions) {
      console.log(' - ', iv);
    }
    console.log(logSeparator);
  }
};

const showDiff = (combined) => {
  if (!deepDiff(combined.dump, combined.result)) {
    logError('Yaml files are same, no need to update, aborting');
    process.exit();
  }

  if (!_.isEmpty(combined.result.in)) {
    showRouteDiff(combined.dump.in, combined.result.in);
  }

  for (const r in combined.result.out) {
    if (combined.result.out.hasOwnProperty(r)) {
      showRouteDiff(combined.dump.out[r], combined.result.out[r]);
    }
  }
};

const showRouteDiff = (prev, next) => {
  // const fieldsToIgnore = [ 'created_at', 'updated_at' ];
  // fieldsToIgnore.includes(diff.path[diff.path.length-1]);

  const diff = deepDiff(prev, next);
  if (!prev || _.isEmpty(prev)) {
    console.log('New route added: ', next.id);
    return;
  }

  console.log('diff for route: ', next.id);
  if (!diff) {
    console.log('No changes');
    return;
  }

  diff.forEach((i) => {
    console.log(
      colors.FgDefault,
      `${diffLabels[i.kind]}: ${i.path.join('.')}`,
    );
    console.log(
      colors.FgRed,
      i.lhs,
      colors.FgGreen,
      i.rhs,
    );
  });
  console.log(colors.FgDefault);
};

module.exports = {
  colors,
  logError,
  logSeparator,
  show,
  showDiff,
  showRouteDiff,
};
