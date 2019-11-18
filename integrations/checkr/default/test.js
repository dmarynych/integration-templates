const check = async () => {
  global.testRunner.configRunner();

  // should send inbound and get response from echo
  const inboundPayload = {
    ssn: '543-43-4645'
  };
  const inboundRequestParams = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(inboundPayload),
  };
  const inboundResult = await global.testRunner.sendInbound(inboundRequestParams);
  const inboundResponse = JSON.parse(inboundResult.data);

  // should send redacted test data from proxy to 3rd party API
  const outboundPayload = `
  first_name=John&middle_name=Alfred&last_name=Smith&email=john.smith@gmail.com&phone=5555555555&zipcode=90401&dob=1970-01-22&ssn=${inboundResponse.ssn}&driver_license_number=F211165
  `;
  console.log('outboundPayload', outboundPayload);
  
  const checkrKeyBase64 = Buffer.from(`${process.env.secret_key}:`).toString('base64');

  const outboundRequestParams = {
    url: 'https://api.checkr.com/v1/candidates',
    method: 'POST',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${checkrKeyBase64}`,
    },
    body: outboundPayload
  };
  const outboundResult = await global.testRunner.sendOutbound(outboundRequestParams);
};

check();
