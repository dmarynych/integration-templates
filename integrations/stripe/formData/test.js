const _ = require('lodash');
const https = require('https'); // should be here for RunKit
const HttpsProxyAgent = require('https-proxy-agent');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const stripeConfig = require('./../config');

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
if(!process.env.stripeSecret) {
  process.env.stripeSecret = stripeConfig.stripeSecret;
}
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const agent = new HttpsProxyAgent(`http://${process.env.username}:${process.env.password}@${process.env.tennantId}.sandbox.verygoodproxy.io:8080`);

const stripeInboundUrl = `https://${process.env.tennantId}.SANDBOX.verygoodproxy.io/post`;

const stripeOutboundUrl = 'https://api.stripe.com/v1/tokens';

let card_number_token = '';
let card_cvc_token = '';

const initialData = {
  card_name: 'John Doe',
  card_number: '4111111111111111',
  card_cvc: '344',
  card_expirationDate: '01 / 2022',
}

const check = async () => {
  // should send inbound and get response from echo
  console.log('sending initial test data to proxy', initialData);
  fetch(stripeInboundUrl, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(initialData),
  }).then(res => res.json()).then((r) => {
    card_number_token = _.get(r, 'json.card_number');
    card_cvc_token = _.get(r, 'json.card_cvc');
    console.log('card number and cvc successfully replaced with tokens');
    console.log({
      ...initialData,
      card_number: card_number_token,
      card_cvc: card_cvc_token,
    })

    const params = new URLSearchParams();
    params.append('card[number]', card_number_token);
    params.append('card[exp_month]', 12);
    params.append('card[exp_year]', 2020);
    params.append('card[cvc]', card_cvc_token);

    // should send outbound and get response from stripe
    console.log('sending redacted test data from proxy to stripe API');
    fetch(stripeOutboundUrl, {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${process.env.stripeSecret}`,
      },
      body: params,
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
