### Authorize.Net Payment Processing Template
If you are using Authorize.Net, sending payments to `secure2.authorize.net/gateway/transact.dll`(`test2.authorize.net/gateway/transact.dll` for sandbox), you could use the template below to reveal your payments' sensitive information to it. The fields to reavel in form data is `x_card_num`, `x_card_code` and `x_bank_acct_num`.   

Note: `secure.authorize.net/gateway/transact.dll`  (`test.authorize.net/gateway/transact.dll` for sanbox) is the legacy URL. This template can also support it.