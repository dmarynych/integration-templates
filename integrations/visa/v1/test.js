const check = async () => {
  global.testRunner.configRunner();

  // should send inbound and get response from echo
  const inboundRequestParams = {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({
      card: '4111111111111111',
      cvv: '344',
    }),
  };
  const inboundResult = await global.testRunner.sendInbound(inboundRequestParams);

  console.log(' -------- inboundResult -------- ');
  console.log(await inboundResult.data);

  // should send redacted test data from proxy to 3rd party API
  const outboundRequestParams = {
    url: 'https://sandbox.api.visa.com/visadirect/fundstransfer/v1/pullfundstransactions',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Basic ${process.env.authToken}`,
    },
    body: JSON.stringify({
      senderPrimaryAccountNumber: JSON.parse(inboundResult.data).card,
      cardCvv2Value: JSON.parse(inboundResult.data).cvv,
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
    }),
  };
  const outboundResult = await global.testRunner.sendOutbound(outboundRequestParams);

  console.log(' -------- outboundResult -------- ');
  console.log('response status - ', await outboundResult.status);
};

module.exports = check;
