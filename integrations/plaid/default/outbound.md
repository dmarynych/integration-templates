Collect account numbers using Plaid auth API. https://plaid.com/docs/#auth

Redact the `$.numbers.ach[*].account` in the response targets: body (for US account numbers)
Redact the `$.numbers.eft[*].account` in the response targets: body (for Canadian account numbers)