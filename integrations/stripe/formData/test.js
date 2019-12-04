const check = async () => {
	global.testRunner.configRunner();
	const initialCardNumber = '4111111111111111';

	// should send inbound and get response from echo
	const inboundRequestParams = {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({
			card_name: 'John Doe',
			card_expirationDate: '01 / 2022',
			card_number: initialCardNumber,
			card_cvc: '344',
		}),
	};
	const inboundResult = await global.testRunner.sendInbound(inboundRequestParams);
	const cardNumber = JSON.parse(inboundResult.data).card_number;
	global.testRunner.proxyAssert.notEqual(initialCardNumber, cardNumber);

	// should send redacted test data from proxy to 3rd party API
	const outboundRequestParams = {
		url: 'https://api.stripe.com/v1/tokens',
		method: 'POST',
		headers: {
			'Content-type': 'application/x-www-form-urlencoded',
			'Authorization': `Bearer ${process.env.secret_key}`,
		},
		body: `card[number]=${cardNumber}&card[cvc]=${JSON.parse(inboundResult.data).card_cvc}&card[exp_month]=12&card[exp_year]=2020`
	};
	const outboundResult = await global.testRunner.sendOutbound(outboundRequestParams);
};

check();
