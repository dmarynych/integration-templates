# Integration templates


## Installing
- clone this repo
```
git clone git@github.com:verygoodsecurity/integration-templates.git
cd integration-templates
```
- install node.js using [Homebrew](https://formulae.brew.sh/formula/node)
```
brew install node
```
- install node.js dependencies
```
npm install
```

## Create a new integration


First, add credentials from your vault to `credentials/creds.json`, it should look like this:
```
{
  "username": "",
  "password": "",
  "tennantId": ""
}
```

---

Then, authenticate:
```
./vgs auth -e dev

```

---

Then, run a command below:
```
./vgs new <integration> <version>

```
for example `./vgs new stripe formData`

It will create a new folder with integration templates under `integrations` folder

---
Then change route config file form here `integrations/<integration>/<version>/dump.yaml`.
When you ready, apply changes by running:
```
./vgs apply <integration> <version>
```
for example `./vgs apply stripe formData`

---

Then add some code to a test file here `integrations/<integration>/<version>/test.js`.
When you ready - run test:
```
./vgs test stripe json
```
for example `./vgs apply stripe formData`

## Troubleshooting
