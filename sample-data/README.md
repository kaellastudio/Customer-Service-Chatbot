# Sample data

Synthetic inputs for testing the workflows without connecting a live
account. Every name, email, order and ID here is invented. Customer emails use
the reserved `.test` domain so nothing can accidentally resolve or receive mail.

**Use them like this:** open a workflow in n8n, click the trigger node,
*Edit Output* / *Pin Data*, paste one case, then run the workflow manually.
Pin a response from `shopify-orders.json` onto *Look up order (Shopify)* to
test order lookups without a store. Nothing leaves n8n until you connect real
credentials.

| File | Feeds | Deliberately includes |
|---|---|---|
| `faq.csv` | The `faq` sheet tab | A starting FAQ for a generic store. Rewrite it for each client |
| `01-chat-messages.json` | Website support chat | An order number and email split across two messages, a right order number with the wrong email, an address change with no email, a prompt injection asking for a refund, and an empty message |
| `02-support-emails.json` | Support inbox | A newsletter, an out-of-office and a bounce, none of which may reach the model, and a reply with the quoted thread below it |
| `03-ghl-webhooks.json` | GoHighLevel bridge | Replies on IG, SMS and FB, a contact with no email, a missing message, and a wrong secret |
| `shopify-orders.json` | Order lookup | Shipped with tracking, not yet shipped, partly shipped without a tracking link, cancelled, and a rejected access token |

The awkward cases are the point. A support bot that handles the happy path is
not finished.
