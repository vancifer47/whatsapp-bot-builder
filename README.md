# WhatsApp Bot Builder

## Overview

The WhatsApp Bot Builder is an Express/Fastify middleware designed to simplify the creation of WhatsApp chatbots using WhatsApp Business Cloud API. It provides an easy-to-use builder class, `whatsappBotBuilder`, that allows you to set up and manage a WhatsApp chatbot quickly.

## Installation

You can install the WhatsApp Bot Builder package using npm:

```bash
npm install whatsapp-bot-builder
```

## Usage

```javascript
const { whatsappBotBuilder } = require("whatsapp-bot-builder");
const whatsappBot = new whatsappBotBuilder({
  webhook_verify_token: ["Your Verification Token"], //used to authenticate whatsapp webhook
  meta_version: ["META API Version"], //Defaults to v16.0
  whatsapp_buisness_id: ["WhatsApp Business Account ID"],
  buisness_phone_number: ["Phone number ID"],
  meta_access_token: ["Meta Access Token"],
});

<!-- Implement Bot listeners -->

const app = express();
app.use(express.json());
app.use("/webhook/events", whatsappBot.init()); //Use it as an express Middleware, it will handle Whatsapp Webhook Events

```

## Sending a WhatsApp Text Message

You can use the `sendWhatsappMessage` function to send a text message via WhatsApp. Here's an example of how to use it:

```javascript
// Send a WhatsApp text message
whatsappBot.sendWhatsappMessage("+91-0000000000", {
  preview_url: false,
  body: "How can I help you today?",
});
```

## Sending a WhatsApp Template Message

You can use the `sendWhatsappTemplate` function to send a template message via WhatsApp. Here's an example of how to use it:

```javascript
// Send a WhatsApp Template message
whatsappBot.sendWhatsappTemplate(
  "+91-0000000000",
  template_name,
  language_code,
  template_components
);
```

## Listening Text Message

You can use the `text` function listen for particular message from a user. Here's an example of how to use it:

```javascript
whatsappBot.text("Hello", ({ sender, data }) => {
  console.log(sender);
  console.log(data);
});
```

## Listening Button Response

You can use the `button` function listen for particular message from a user. Here's an example of how to use it:

```javascript
whatsappBot.button(button_payload, ({ sender, data }) => {
  console.log(sender);
  console.log(data);
});
```

## Listening for a Document/Image

Only one listener for document/image is permissible, you can use `image` or `document` function for the same,
Example for the same

```javascript
whatsappBot.image(({ sender, data }) => {
  console.log(sender);
  console.log(data);
});
```
