# Sample data

Made-up inputs for trying the workflows without connecting a real account.
Every name, email, order and ID is invented, and customer emails use the
reserved `.test` domain, so nothing can be delivered anywhere by accident.

To use them, open a workflow in n8n, click the trigger node, choose *Edit
Output* (pinned data), paste in one case and run the workflow by hand. To
test order lookups without a shop, pin a response from `shopify-orders.json`
onto *Look up order (Shopify)*. Nothing leaves n8n until you connect real
credentials.

| File | Feeds | What's in it |
|---|---|---|
| `faq.csv` | The `faq` sheet tab | A starter FAQ for a generic shop. Rewrite it for each client |
| `01-chat-messages.json` | Website support chat | An order number and email split across two messages, a right order number with the wrong email, an address change with no email, a message trying to talk the bot into a refund, and an empty message |
| `02-support-emails.json` | Support inbox | A newsletter, an out-of-office and a bounce (none of which should reach the model), and a reply with the old thread quoted underneath |
| `03-ghl-webhooks.json` | GoHighLevel bridge | Replies on Instagram, SMS and Facebook, a contact with no email, a missing message, and a wrong secret |
| `shopify-orders.json` | Order lookup | Shipped with tracking, not yet shipped, partly shipped with no tracking link, cancelled, and a rejected access token |

Most of these are there for the cases that go wrong rather than the ones that
go right. A support bot that only handles the easy questions isn't finished.
