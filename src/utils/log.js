const _ = require('lodash');

const diffLabels = {
  'N': 'property/element added',
  'D': 'property/element was deleted',
  'E': 'property/element was edited',
  'A': 'array changed',
}

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
}

const logSeparator = '-------------------';

const logError = (msg) => {
  console.log(colors.FgRed, msg, colors.FgDefault);
}

const show = (integrationList) => {
  console.log('Existing integrations:');
  console.log(logSeparator);
  for (let i in integrationList) {
    console.log(i)
    console.log(' versions:');
    for (let iv in integrationList[i].versions) {
      console.log(' - ', iv);
    }
    console.log(logSeparator);
  }
}

const showDumpDiff = (diffArray, combinedDump) => {
  const parsedDiff = {
    data: {},
  }

  diffArray.forEach(diff => {
    if (!parsedDiff.data[diff.path[1]]) {
      parsedDiff.data[diff.path[1]] = [ diff ];
    } else {
      parsedDiff.data[diff.path[1]].push(diff);
    }
  })

  console.log('Existing differences:');
  console.log(logSeparator);
  for (let idx in parsedDiff.data) {
    if (combinedDump.data[idx]) {
      // changes in existing routes
      console.log(`diff for ${combinedDump.data[idx].id}`);
      const name = _.get(combinedDump.data[idx], 'attributes.tags.name');
      if (name) console.log(`name: ${name}`);

      parsedDiff.data[idx].forEach(diff => {
        console.log(colors.FgDefault, `${diffLabels[diff.kind]}: ${diff.path.pop()}`);
        console.log(colors.FgRed, diff.lhs, colors.FgGreen, diff.rhs);
      })
      console.log(colors.FgDefault, logSeparator);
    }
  }
  //
}

module.exports = {
  logError,
  logSeparator,
  show,
  showDumpDiff,
}
