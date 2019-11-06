const _ = require('lodash');
const https = require('https'); // should be here for RunKit
const HttpsProxyAgent = require('https-proxy-agent');
const fetch = require('node-fetch');

/*
interface testParams {
  config,
  envVariables;
}
*/

const configRunner = async (testParams) => {
  if (!process.env.username) {
    console.log('Missing username, aborting');
    return;
  }
  if(!process.env.password) {
    console.log('Missing password, aborting');
    return;
  }
  if(!process.env.tennantId) {
    console.log('Missing tennantId, aborting');
    return;
  }
  for (const variable in testParams.envVariables) {
    if(!process.env[variable] && testParams.envVariables.hasOwnProperty(variable)) {
      if (!testParams.config[variable]) {
        console.log(testParams.config)
        console.log(`can\'t find ${variable}, aborting`);
        return;
      }
      process.env[variable] = testParams.config[variable];
    }
  }
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  process.env.HTTPS_PROXT_AGENT_URL = `http://${process.env.username}:${process.env.password}@${process.env.tennantId}.sandbox.verygoodproxy.io:8080`;
}


const sendInbound = async (config) => {
  try {
    const inboundBody = payloadHelper[config.body.type](config.body.value);
    const response = await fetch(config.url || `https://${process.env.tennantId}.SANDBOX.verygoodproxy.io/post`, {
      method: config.method,
      headers: config.headers,
      body: inboundBody.body,
      ...config.requestParamsOverrides,
    })
    return await response.json();
  } catch (error) {
    console.log('Smth went wrong', error);
    return error;
  }
}

const sendOutbound = async (config) => {
  try {
    const outboundBody = payloadHelper[config.body.type](config.body.value);
    const response = await fetch(config.url, {
      agent: config.agent || new HttpsProxyAgent(process.env.HTTPS_PROXT_AGENT_URL),
      body: outboundBody.body,
      method: config.method,
      headers: config.headers,
      ...config.requestParamsOverrides,
    })
    return response;
  } catch (error) {
    console.log('Smth went wrong', error);
    return error;
  }
}

const payloadHelper = {
  formData: function (rawData/* {} | string*/) {
    const payload = {
      body: new URLSearchParams(),
      add: function (field/*: [label, value] | string*/) {
        if (!field instanceof Array) {
          field = field.split('=');
        }
        this.body.append(field[0], field[1]);
      },
      remove: function (label/*: string*/) {
        this.body.delete(label);
      },
      get: function (label/*: string*/) {
        this.body.get(label);
      },
      set: function (field/*: [label, value] | string */) {
        if (!field instanceof Array) {
          field = field.split('=');
        }
        this.body.set(field[0], field[1]);
      },
      entries: function () {
        this.body.entries();
      },
      keys: function () {
        this.body.keys();
      },
      values: function () {
        this.body.values();
      },
    }

    if (rawData) deepSet(rawData, payload, payload.add);

    return payload;
  },
  json: function (rawData/* {} */) {
    // return ;
    const payload = {
      body: JSON.stringify(rawData), //JSON.stringify({}),
      add: function (field/*: [label, value]*/) {
        let parsed = JSON.parse(this.body);
        this.body = JSON.stringify({
          ...parsed,
          [field[0]]: field[1],
        });
      },
      remove: function (label/*: string*/) {
        let parsed = JSON.parse(this.body);
        delete parsed[label]
        this.body = JSON.stringify(parsed);
      },
      get: function (label/*: string*/) {
        return JSON.parse(this.body)[label];
      },
      set: function (field/*: [label: value]*/) {
        this.add(field);
      },
      entries: function () {
        let parsed = JSON.parse(this.body);
        Object.entries(parsed);
      },
      keys: function () {
        let parsed = JSON.parse(this.body);
        Object.keys(parsed);
      },
      values: function () {
        let parsed = JSON.parse(this.body);
        Object.values(parsed);
      },
    }

    // if (rawData) deepSet(rawData, payload, payload.add);

    return payload;
  },
};

function deepSet(rawData, payload, setFn) {
  Object.entries(rawData).forEach((field) => {
    const [key, value] = field;
    if (typeof value === 'object' && value !== null && !(value instanceof Array)) {
      deepSet(value, payload, setFn);
    } else {
      setFn.call(payload, field);
    }
  });
}


module.exports = {
  configRunner,
  sendInbound,
  sendOutbound,
  payloadHelper,
}

// for dashboard
global.testRunner = {
  configRunner,
  sendInbound,
  sendOutbound,
  payloadHelper,
}
