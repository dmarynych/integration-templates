const check = async () => {
  global.testRunner.configRunner();

  // should send inbound and get response from echo
  const sampleAccNumber = 1111222233330000;
  const inboundPayload = {
    account_number: sampleAccNumber
  };
  const inboundRequestParams = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(inboundPayload),
  };
  const inboundResult = await global.testRunner.sendInbound(inboundRequestParams);
  const inboundResponse = JSON.parse(inboundResult.data);

  global.testRunner.proxyAssert.notEqual(sampleAccNumber, inboundResponse.account_number);

  // should send redacted test data from proxy to 3rd party API
  const outboundPayload = `{"account_number":"${inboundResponse.account_number}"}`;
  const outboundRequestParams = {
    url: 'https://echo.apps.verygood.systems/post',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: outboundPayload
  };
  const outboundResponse = await global.testRunner.sendOutbound(outboundRequestParams);
  const response = JSON.parse(outboundResponse);
  const data = JSON.parse(response.data);

  global.testRunner.proxyAssert.equal(sampleAccNumber, data.account_number);
};

check();
module.exports = check;
