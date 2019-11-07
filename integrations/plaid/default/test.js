const check = async () => {
  global.testRunner.configRunner();

  // should send redacted test data from proxy to 3rd party API
  const outboundPayload = {
    "client_id": process.env.client_id,
    "secret": process.env.secret,
    "access_token": process.env.access_token
  };
  console.log('outboundPayload', JSON.stringify(outboundPayload));
  
  const outboundRequestParams = {
    url: 'https://sandbox.plaid.com/auth/get',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${process.env.secret_key}`,
    },
    body: JSON.stringify(outboundPayload)
  };
  const outboundResult = await global.testRunner.sendOutbound(outboundRequestParams)
};

module.exports = check;
