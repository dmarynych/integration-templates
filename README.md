# Integration templates


## Installing
- clone this `integration-templates` repo
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

Run a command below:
```
./vgs new stripe json
```
It will create a new folder with integration templates under `integrations` folder


node tool auth or auth-dev
put file with credentials to /stuff/credentials dir
node tool set-creds

node tool apply selected integration
node tool test selected integration

## Troubleshooting
