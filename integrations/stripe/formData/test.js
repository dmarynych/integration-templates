const testRunner = require('../../../src/utils/test-runner');
const stripeConfig = require('./../config');

const check = async () => {
  testRunner.configRunner({
    config: stripeConfig,
  })

  // should send inbound and get response from echo
  const inboundRequestParams = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: {
      type: 'json',
      value: {
        card_name: 'John Doe',
        card_expirationDate: '01 / 2022',
        card_number: '4111111111111111',
        card_cvc: '344',
      },
    },
  };
  const inboundResult = await testRunner.sendInbound(inboundRequestParams);

  console.log(' -------- inboundResult -------- ');
  console.log(await inboundResult.data);

  // should send redacted test data from proxy to 3rd party API
  const outboundRequestParams = {
    url: 'https://api.stripe.com/v1/tokens',
    method: 'POST',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${process.env.secret_key || stripeConfig.secret_key}`,
    },
    body: {
      type: 'formData',
      value: {
        'card[number]': JSON.parse(inboundResult.data).card_number,
        'card[cvc]': JSON.parse(inboundResult.data).card_cvc,
        'card[exp_month]': 12,
        'card[exp_year]': 2020,
      },
    },
  };
  const outboundResult = await testRunner.sendOutbound(outboundRequestParams);

  console.log(' -------- outboundResult -------- ');
  console.log('response status - ', await outboundResult.status);
};

module.exports = check;
