# Integration templates


## Installing
- clone this repo
```bash
git clone git@github.com:verygoodsecurity/integration-templates.git
cd integration-templates
```
- install node.js using [Homebrew](https://formulae.brew.sh/formula/node)
```bash
brew install node
```
- install node.js dependencies
```bash
npm install
```

## Create a new integration

First, add credentials from your vault to `credentials/creds.json`, it should look like this:
```json
{
  "username": "",
  "password": "",
  "tennantId": ""
}
```

---

Then, authenticate:
```bash
./tool auth -e dev

```

---

Then, run a command below:
```bash
./tool new <integration> <version>

```
for example `./tool new stripe formData`

It will create a new folder with integration templates under `integrations` folder

---
Then change routes config file form here `integrations/<integration>/<version>/dump.yaml`.
When you ready, apply changes by running:
```bash
./tool apply <integration> <version>
```
for example `./tool apply stripe formData`

---

Then add some code to a test file here `integrations/<integration>/<version>/test.js`.
When you ready - run test:
```bash
./tool test stripe json
```
for example `./tool apply stripe formData`

## Writing tests

Send inbound request:
```js
  const inboundRequestParams = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({
      card: '4111111111111111',
      cvv: '344',
    }),
  };
  const inboundResult = await global.testRunner.sendInbound(inboundRequestParams;
```

Send outbound request:
```js
  const outboundRequestParams = {
    url: 'https://sandbox.api.visa.com/visadirect/fundstransfer/v1/pullfundstransactions',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Basic ${process.env.authToken}`,
    },
    body: JSON.stringify({}),
  };
  const outboundResult = await global.testRunner.sendOutbound(outboundRequestParams);
```


## Config
Each integratio nshould have `config.json` file:
```json
{
  "params": {
    "authToken": ""
  },
  "category": "Payment Processors"
}
```
All variables stored in `params` are available in `process.env` object, you can use it in tests.



### Replace operation pipeline
Each integration with operation pipeline can be splitted with replacer files for debug.

You can start with default template, by running:
```bash
./tool new echo -o
```

All mapped operation types (js) can be extracted to replacer files
Simply put file with contents to /integrations/%INTEGRATION_NAME%/%INTEGRATION_VERSION%/replacers.
```yml
operations: |-
            [ {
              "@type" : "type.googleapis.com/JavascriptOperationConfig",
              "script" : "const foo = bar;"
            }]
```
with this:
```yml
operations: |-
            [ {
              "@type" : "type.googleapis.com/JavascriptOperationConfig",
              "script" : "replaced:%FILE_NAME%"
            }]
```
and create file in integration folder with this:
Create file in integration folder with contents in /integrations/%INTEGRATION_NAME%/%INTEGRATION_VERSION%/replacers.
```js
const foo = bar;
```

Now running apply command will replace 'replaced:%filename%' keys in YAML dump with contents from replacers values before updating routes for vault, but will keep YAML file with 'replaced:' keys.
```bash
./tool apply integration version
```
