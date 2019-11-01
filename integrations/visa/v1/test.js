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
  card: '4111111111111111',
  cvv: '344',
}

const params = {
  "systemsTraceAuditNumber": 451000,
  "retrievalReferenceNumber": "330000550000",
  "localTransactionDateTime": "2019-10-31T08:50:30",
  "acquiringBin": 408999,
  "acquirerCountryCode": "840",
  "transactionCurrencyCode": "USD",
  "senderName": "John Smith",
  "senderCountryCode": "USA",
  "senderAddress": "44 Market St.",
  "senderCity": "San Francisco",
  "senderStateCode": "CA",
  "recipientName": "Adam Smith",
  "recipientPrimaryAccountNumber": "4957030420210462",
  "amount": "42.00",
  "businessApplicationId": "AA",
  "transactionIdentifier": 381228649430011,
  "merchantCategoryCode": 6012,
  "sourceOfFundsCode": "03",
  "cardAcceptor": {
    "name": "Acceptor 1",
    "terminalId": "365539",
    "idCode": "VMT200911026070",
    "address": {
      "state": "CA",
      "county": "081",
      "country": "USA",
      "zipCode": "94105"
    }
  },
  "feeProgramIndicator": "123"
};


const check = async () => {
  // should send inbound and get response from echo
  console.log('sending initial test data to proxy', initialData);
  fetch(inboundUrl, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(initialData),
  }).then(res => res.json()).then((r) => {
    card_number_token = _.get(r, 'json.card');
    card_cvv_token = _.get(r, 'json.cvv');
    console.log('card number and cvv successfully replaced with alias');
    console.log({
      card_number: card_number_token,
      card_cvv: card_cvv_token,
    })
    const testData = {
      ...params,
      cardCvv2Value: card_cvv_token,
      senderPrimaryAccountNumber: card_number_token,
    };

    const body = JSON.stringify(testData)

    // should send outbound and get response from visa
    console.log('sending redacted test data from proxy to Visa Direct', body, testData);
    fetch(outboundUrl, {
      body,
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Basic ${process.env.authToken}`,
      },
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
