const _ = require('lodash');
const https = require('https'); // should be here for RunKit
const HttpsProxyAgent = require('https-proxy-agent');
const fetch = require('node-fetch');
const config = require('./../config');

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
if(!process.env.authToken) {
  if (!config.authToken) {
    console.log('can\'t find authToken, aborting');
    return;
  }
  process.env.authToken = config.authToken;
}
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const agent = new HttpsProxyAgent(`http://${process.env.username}:${process.env.password}@${process.env.tennantId}.sandbox.verygoodproxy.io:8080`);

const inboundUrl = `https://${process.env.tennantId}.SANDBOX.verygoodproxy.io/post`;

const outboundUrl = 'https://sandbox.api.visa.com/visadirect/fundstransfer/v1/pullfundstransactions';

let card_number_token = '';
let card_cvv_token = '';

const initialData = {
  card_name: 'John Doe',
  card: '4111111111111111',
  cvv: '344',
  card_expirationDate: '01 / 2022',
}

const check = async () => {
  // should send inbound and get response from echo
  console.log('sending initial test data to proxy', initialData);
  fetch(inboundUrl, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(initialData),
  }).then(res => console.log(res)).then((r) => {
  // }).then(res => res.json()).then((r) => {
    card_number_token = _.get(r, 'json.card');
    card_cvv_token = _.get(r, 'json.cvv');
    console.log('card number and cvv successfully replaced with tokens');
    console.log({
      ...initialData,
      card_number: card_number_token,
      card_cvv: card_cvv_token,
    })

    const params = {
      "cardCvv2Value": card_cvv_token,
      "senderPrimaryAccountNumber": card_number_token
    };

    // should send outbound and get response from visa
    console.log('sending redacted test data from proxy to Visa Direct');
    fetch(outboundUrl, {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${process.env.authToken}`,
      },
      body: JSON.stringify(params),
      agent: agent,
    }).then((r) => {
      if (r.status === 200) {
        console.log('response.status === 200, outbound request successful');
      } else {
        console.log(r, ' - outbound failed');
      }
    });
  });
};

module.exports = check;
