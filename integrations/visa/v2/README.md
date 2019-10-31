## Visa Direct Example Integration

Please note: Replace TENANT_ID with your actual tenant identifier in scripts below.
We recommend enable Record payloads in Logs tab on dashboard before sending requests, so you can debug your integration

1. Apply this configuration to your vault

    If you don't have any routes:
    `vgs --tenant=TENANT_ID route --create-all < visa-direct/example.yml`

    If you have routes:
    `vgs --tenant=TENANT_ID route --sync-all < visa-direct/example.yml`

2. Run a redaction request against your inbound route

```
curl https://<TENANT_ID>.SANDBOX.verygoodproxy.com/post \
  -H "Content-type: application/json" \
  -d '{"cvv": "123", "card": "4895142232120006"}'
```

3. Access visa developer portal

https://developer.visa.com/portal/auth/login

4. Create new app and download app private key (let's use Visa Direct Application)

5. Go to app's Credentials tab and download a client cert (see more details on authentication here https://developer.visa.com/pages/working-with-visa-apis/two-way-ssl)

6. Create p12

```
openssl pkcs12 -export -inkey key_9d35d23a-3cc4-4f54-b8f7-7ce17079cc01.pem -in cert.pem -name myProject -out myProject.p12 -password pass:'changeit'
```

7. From the same "Credentials" tab copy "User Id" and "Password" and make base64 version of it.

```
echo -n "P9S8OFL0DGYMYXBZTW4A21ex2aLwsIWtQW0p_wspbJZ9OC0Ts:L37VchJ0K" | base64

UDlTOE9GTDBER1lNWVhCWlRXNEEyMWV4MmFMd3NJV3RRVzBwX3dzcGJKWjlPQzBUczpMMzdWY2hKMEs=
```

8. Cat private key and cert.pem into one file

```
cat key_9d35d23a-3cc4-4f54-b8f7-7ce17079cc01.pem <(echo) cert.pem > myProject.pem
```

9. Test direct connection
```
curl -k -X POST --cert myProject.p12:changeit \                
https://sandbox.api.visa.com/visadirect/fundstransfer/v1/pullfundstransactions \
    -H "Accept: application/json,application/octet-stream" \
    -H "Authorization: Basic WU9TMTVYMTdNUTQ0NUlXUVBPTUMyMVc2TTg1MGl2M25fRUJIZExKMHdhczdOVVRYbzp0djNCd1RBaW1t=" \
    -H "Content-Type: application/json" \
    -d '{
"acquirerCountryCode": "840",
"acquiringBin": "408999",
"amount": "124.02",
"businessApplicationId": "AA",
"cardAcceptor": {
"address": {
"country": "USA",
"county": "081",      
"state": "CA",
"zipCode": "94404"
},  
"idCode": "ABCD1234ABCD123",
"name": "Visa Inc. USA-Foster City",
"terminalId": "ABCD1234"
},  
"cavv": "0700100038238906000013405823891061668252",
"foreignExchangeFeeTransaction": "11.99",
"localTransactionDateTime": "2018-10-31T15:48:09",
"retrievalReferenceNumber": "330000550000",
"senderCardExpiryDate": "2015-10",
"senderCurrencyCode": "USD",
"senderPrimaryAccountNumber": "4895142232120006",
"cardCvv2Value": "123",
"surcharge": "11.99",
"systemsTraceAuditNumber": "451001",
"nationalReimbursementFee": "11.22",
"cpsAuthorizationCharacteristicsIndicator": "Y",
"addressVerificationData": {
"street": "XYZ St",
"postalCode": "12345"
}   
}'
```

Output should be smth like:
```
{"transactionIdentifier":105714624332281,"actionCode":"00","approvalCode":"21324K","responseCode":"5","transmissionDateTime":"2018-09-25T15:55:56.000Z","feeProgramIndicator":"123"}
```

If you get errors like 
`curl: (58) SSL: Can't load the certificate "myProject.pem" and its private key: OSStatus -25299`
update curl:
```
brew uninstall curl
brew install curl --with-openssl
```

10. Convert cert to base64:
```
cat myProject.p12 | base64
```

11. Upload cert:
For this step you need to contact VGS support via email <support@verygoodsecurity.com>, your slack channel or intercom
 
12. Run a reveal operation against your newly created outbound route. 
Please note, to check if data was revealed add aliases from redacted payload

```
"senderPrimaryAccountNumber": "4895140987880006",
"cardCvv2Value": "tok_sandbox_vaV6t74rFkniFBGJNpVYvC",
```
![recorded payload](visa-direct-redact.png "Example recorded payload with redacted data")

```
curl -k -X POST \
--proxy USt5UMdBM7kS6p5abiP9HqdU:9af082c5-59b7-40c0-a17d-265ac356ded5@tnturegfxga.SANDBOX.verygoodproxy.com:8080 \
https://sandbox.api.visa.com/visadirect/fundstransfer/v1/pullfundstransactions \
    -H "Accept: application/json,application/octet-stream" \
    -H "Authorization: Basic WU9TMTVYMTdNUTQ0NUlXUVBPTUMyMVc2TTg1MGl2M25fRUJIZExKMHdhczdOVVRYbzp0djNCd1RBaW1t=" \
    -H "Content-Type: application/json" \
    -d '{
"acquirerCountryCode": "840",
"acquiringBin": "408999",
"amount": "124.02",
"businessApplicationId": "AA",
"cardAcceptor": {
"address": {
"country": "USA",
"county": "081",
"state": "CA",
"zipCode": "94404"
},
"idCode": "ABCD1234ABCD123",
"name": "Visa Inc. USA-Foster City",
"terminalId": "ABCD1234"
},
"cavv": "0700100038238906000013405823891061668252",
"foreignExchangeFeeTransaction": "11.99",
"localTransactionDateTime": "2018-10-31T15:48:09",
"retrievalReferenceNumber": "330000550000",
"senderCardExpiryDate": "2015-10",
"senderCurrencyCode": "USD",
"senderPrimaryAccountNumber": "4895140987880006",
"cardCvv2Value": "tok_sandbox_vaV6t74rFkniFBGJNpVYvC",
"surcharge": "11.99",
"systemsTraceAuditNumber": "451001",
"nationalReimbursementFee": "11.22",
"cpsAuthorizationCharacteristicsIndicator": "Y",
"addressVerificationData": {
"street": "XYZ St",
"postalCode": "12345"
}
}'
```
Output should be smth like:

{"transactionIdentifier":306364500201606,"actionCode":"00","approvalCode":"98765X","responseCode":"5","transmissionDateTime":"2018-11-01T10:41:54.000Z","cavvResultCode":"8","cpsAuthorizationCharacteristicsIndicator":"3333"}%   

![recorded payload](visa-direct-reveal.png "Example recorded payload with revealed data")