const check = async () => {
  global.testRunner.configRunner();

  // should send inbound and get response from echo
  const inboundPayload = {
    json: 123
  };
  const inboundRequestParams = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(inboundPayload),
  };
  const inboundResult = await global.testRunner.sendInbound(inboundRequestParams);
  const inboundResponse = JSON.parse(inboundResult.data);

  // should send redacted test data from proxy to 3rd party API
  const outboundPayload = `card[number]=${inboundResponse.card_number}&card[cvc]=${inboundResponse.card_cvc}`;
  const outboundRequestParams = {
    url: 'https://some-api.com/post',
    method: 'POST',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${process.env.secret_key}`,
    },
    body: outboundPayload
  };
  const outboundResult = await global.testRunner.sendOutbound(outboundRequestParams)
};

check();
module.exports = check;
