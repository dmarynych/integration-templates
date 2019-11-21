const _ = require('lodash');
const https = require('https'); /* should be here for RunKit*/
const HttpsProxyAgent = require('https-proxy-agent');
const fetch = require('node-fetch');

const configRunner = async () => {  
  if (!process.env.vgs_username) {
    console.log('Missing username, aborting');
    return;
  }
  if (!process.env.vgs_password) {
    console.log('Missing password, aborting');
    return;
  }
  if (!process.env.tennantId) {
    console.log('Missing tennantId, aborting');
    return;
  }
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  process.env.HTTPS_PROXT_AGENT_URL = `http://${process.env.vgs_username}:${process.env.vgs_password}@${process.env.tennantId}.sandbox.verygoodproxy.io:8080`;
}


const sendInbound = async (config) => {
  try {
    const response = await fetch(config.url || `https://${process.env.tennantId}.SANDBOX.verygoodproxy.io/post`, {
      method: config.method,
      headers: config.headers,
      body: config.body,
      ...config.requestParamsOverrides,
    });
    console.log(' -------- inboundResult -------- ');
    console.log('inbound status - ', response.status);
    console.log('inbound text - ', response.statusText);
    console.log('inbound headers', response.headers['content-type']);
    
    const resp = await response.json();
    console.log('inbound body - ', resp);

    return resp;
  } catch (error) {
    console.log('Smth went wrong', error);
    return error;
  }
}

const sendOutbound = async (config) => {
  try {
    const response = await fetch(config.url, {
      agent: config.agent || new HttpsProxyAgent(process.env.HTTPS_PROXT_AGENT_URL),
      body: config.body,
      method: config.method,
      headers: config.headers,
      ...config.requestParamsOverrides,
    })
    console.log(' -------- outboundResult -------- ');
    console.log('response status - ', response.status);
    console.log('response text - ', response.statusText);
    // console.log('response body - ', await response.text());
    console.log('outbound headers', response.headers['content-type']);
    
    const resp = response.headers['content-type'] === 'application/json' ? await response.json() : await response.text();
    console.log('response json - ', resp);

    return resp;
  } catch (error) {
    console.log('Smth went wrong', error);
    return error;
  }
}

/*for dashboard*/
global.testRunner = {
  configRunner,
  sendInbound,
  sendOutbound,
}
