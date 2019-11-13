const commander = require('commander');
const newCommand = require('./commands/new');

const vgsCli = require('./src/utils/vgs-cli');
const runner = require('./src/runner');
const log = require('./src/utils/log');
const cmn = require('./src/utils/common');

const httpLogger = require('./src/utils/http-logger');
const boxes = require('./src/utils/boxes');

const program = new commander.Command();
program.version(require('./package.json').version);
const token = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJndUFLOGJieERmYUpKcldQMFRKX1Z5U1hEeU8ycFVyRWhoSG5XcUJTdjBjIn0.eyJqdGkiOiJmODFhNzI0Mi00ZWIzLTRkYTAtOGY3MS04NmY5YTNjOTQ3NGMiLCJleHAiOjE1NzM2NDY0NjAsIm5iZiI6MCwiaWF0IjoxNTczNjQ2MTYwLCJpc3MiOiJodHRwczovL2F1dGgudmVyeWdvb2RzZWN1cml0eS5pby9hdXRoL3JlYWxtcy92Z3MiLCJhdWQiOlsiZGFzaGJvYXJkIiwibWVtZW50byIsImFjdC1tZ210LWh0dHAtYXBpIiwidmF1bHQtbWdtdC1odHRwLWFwaSIsImZsb29kIiwiYXVkaXRpdCIsImZsdXgiLCJpYW0tYXBpIiwicHJlZmVyZW5jZS1tZ210IiwidmdzLWNvbGxlY3Qta2VlcGVyIiwiY2VydC1tYW5hZ2VyIl0sInN1YiI6IjJlZGFlZGFhLTY2ODgtNDZmZi04MjZlLTRjMGU3MWNiZTlmYyIsInR5cCI6IkJlYXJlciIsImF6cCI6ImRhc2hib2FyZCIsIm5vbmNlIjoiODhjYmViMDAtOTY1NC00ZDQwLTg5OTItNzFmODMwMmZmY2RkIiwiYXV0aF90aW1lIjoxNTczNjM2OTM2LCJzZXNzaW9uX3N0YXRlIjoiYzAxMmE5ZWYtNTY1MC00ZDc3LTg3NDItODhhY2Y0OWUyMmQzIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vMTI3LjAuMC4xOjQyMDAiLCJodHRwczovL2Rhc2hib2FyZC1kZW1vLnZlcnlnb29kc2VjdXJpdHkuaW8iLCJodHRwczovL2Rhc2hib2FyZC1zdGFnaW5nLnZlcnlnb29kc2VjdXJpdHkuaW8iLCJodHRwOi8vbG9jYWxob3N0OjczNTciLCJodHRwOi8vbG9jYWxob3N0OjQyMDAiLCJodHRwczovL2Rhc2hib2FyZC52ZXJ5Z29vZHNlY3VyaXR5LmlvIl0sInJlc291cmNlX2FjY2VzcyI6eyJ2YXVsdC1tZ210LWh0dHAtYXBpIjp7InJvbGVzIjpbImNyZWRlbnRpYWxzOndyaXRlIiwiaG9zdG5hbWVzOndyaXRlIiwiYWNjZXNzLWxvZ3M6cmVhZCIsInJvdXRlczp3cml0ZSIsIm9wZXJhdGlvbjpzaWduIiwiY2VydGlmaWNhdGVzOndyaXRlIiwidXBzdHJlYW1zOndyaXRlIiwidmF1bHRzOndyaXRlIl19LCJhdWRpdGl0Ijp7InJvbGVzIjpbImFjY2Vzcy1sb2dzOnJlYWQiXX0sImFjdC1tZ210LWh0dHAtYXBpIjp7InJvbGVzIjpbInZhdWx0czpjcmVhdGU6bm8tbGltaXQiLCJvcmdhbml6YXRpb25zOmNyZWF0ZTp2Z3Mtc3RhZmYtZmxhZyIsIm9yZ2FuaXphdGlvbnM6Y3JlYXRlOm5vLWxpbWl0Iiwib3JnYW5pemF0aW9uLXVzZXJzOndyaXRlIiwib3JnYW5pemF0aW9uczp3cml0ZSIsInZhdWx0czp3cml0ZSJdfSwiY2VydC1tYW5hZ2VyIjp7InJvbGVzIjpbImNlcnQtbWFuYWdlcjp3cml0ZSJdfSwiaWFtLWFwaSI6eyJyb2xlcyI6WyJwcm9maWxlOndyaXRlIl19LCJmbHV4Ijp7InJvbGVzIjpbImFuYWx5dGljczpyZWFkIl19LCJtZW1lbnRvIjp7InJvbGVzIjpbImF1ZGl0LWxvZ3M6cmVhZCJdfSwiYnJva2VyIjp7InJvbGVzIjpbInJlYWQtdG9rZW4iXX0sImRhc2hib2FyZCI6eyJyb2xlcyI6WyJleHBlcmltZW50czp2aWV3Iiwib3JnYW5pemF0aW9ucy1zdXBwb3J0LWxhYmVsczp2aWV3Il19LCJmbG9vZCI6eyJyb2xlcyI6WyJyZXBvcnRzOnJlYWQiXX19LCJzY29wZSI6Im9wZW5pZCBhdWRpdC1sb2dzOnJlYWQgcmVwb3J0czpyZWFkIHVzZXJuYW1lIHZhdWx0czp3cml0ZSB2YWx2ZSBvcmdhbml6YXRpb25zOndyaXRlIHZncy1jb2xsZWN0LWtlZXBlciBjZXJ0aWZpY2F0ZXM6d3JpdGUgY3JlZGVudGlhbHM6d3JpdGUgcHJvZmlsZTp3cml0ZSBjZXJ0LW1hbmFnZXI6d3JpdGUgYXV0aDAgYW5hbHl0aWNzOnJlYWQgaWRwIGFjY2Vzcy1sb2dzOnJlYWQgaG9zdG5hbWVzOndyaXRlIHVwc3RyZWFtczp3cml0ZSByb3V0ZXM6d3JpdGUgb3JnYW5pemF0aW9uLXVzZXJzOndyaXRlIiwiaWRwIjoib2lkYyIsImF1dGgwIjoiYXV0aDB8NWQ5MzdmNjIxZGQxMTEwZTkzN2U0ZDJlIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiZG15dHJvLnByb2tvcG92eWNoK2ludGVncmF0aW9ucy10ZXN0c0B2Z3MuaW8ifQ.D0hX4Vt7Oqb07qESjYQJmHdpSa-e5c1Mv52KEhfnYNd1INH-1sRiayJzp5X3-hm3Eo3xJZMHL2zTlZ4S7Gmx-bNzGyuR9vUBqZAN7Be1aAsfw2OcCLO4yHU_SjwsnwBMfKwWUxrkE0iI0TM_OczxkO9ccymOyGf84b6CD0UeRGST6Dw-Ek2Iexo-mWGgBtlki09xHEPn05G4N5_Ro0eR2sQe1vF2p_FjbTsb1VUywnEMxxdMGhyj4TvHJyRlQmkzVS7YSYUbRrQqZnLYyCmbsyqnUI340RiLN6crrBRfaynHGu-jlk1UaLP5_y4YEHtHAmsBcpdlP9I23Kxt5p6tnw';

program  
  .option('-d, --debug', 'output extra debugging');

program
  .command('new <name> [version]')
  .description('Create a new template. For example "new visa v1" to kickstart new integration')
  .action((name, version = 'default') => {
    newCommand(name, version, program);
  });

program
  .command('show')
  .description('Show list of integrations')
  .action(() => {
    const integrationList = cmn.getIntegrationList();
    log.show(integrationList);
  });


program
  .command('apply <name> [version]')
  .description('Apply integration. For example "apply visa v1" to save routes')
  .action((name, version = 'default') => {
    runner.runDumpAndSync(name, version);
  });

program
  .command('test <name> [version]')
  .description('Test integration. For example "test visa v1" to test if it works')
  .action((name, version = 'default') => {
    runner.tryToRun(name, version);
  });

program
  .command('dump')
  .description('Dump routes, using creds file "stuff/credentials/creds.json"')
  .requiredOption('-e, --environment <environment>', 'VGS environment, might be "dev", "prod"')
  // .requiredOption('-t, --environment <environment>', 'VGS environment, might be "dev", "prod"')
  .action((cmd) => {
    vgsCli.runDump(cmd.environment);
  });

program
  .command('auth')
  .description('Auth on VGS')
  .requiredOption('-e, --environment <environment>', 'VGS environment, might be "dev", "prod"')
  .action((cmd) => {
    vgsCli.runAuth(cmd.environment);
  });

program
  .command('bxs')
  .action(() => {
    boxes.logger()
  })

program
  .command('slr')
  .action(() => {
    httpLogger.setLogsRecording(token);
  })

program
  .command('gl')
  .action(() => {
    httpLogger.getLogs(token);
  })

program.parse(process.argv);
 



