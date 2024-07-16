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
whatsappBot.sendWhatsappDocument(
  "+91-0000000000",
  template_name,
  language_code,
  template_components
);
```

## Sending a WhatsApp Document

You can use the `sendWhatsappDocument` function to send a document via WhatsApp. Here's an example of how to use it:

```javascript
// Send a WhatsApp document
whatsappBot.sendWhatsappDocument("+91-0000000000", {
  id: "1012124500309246", // ID generated using uploadMedia
  filename: "sample",
}); // if file is webp then it's sent as sticker and hence make isSticker true
```

## Upload Media

You can use the `uploadMedia` function to upload media to Whatsapp Media . Here's an example of how to use it:

```javascript
// Send a WhatsApp Template message
let response = await whatsappBot.uploadMedia(filePath); // if file is webp then make sure choosing isWebpAnimated based on it's animation, default it static
console.log(response);
```

## Fetch Media Url Data

You can use the `fetchUserMediaUrl` function to get media url from Whatsapp Media ID. Here's an example of how to use it:

```javascript
// Send a WhatsApp Template message
let response = await whatsappBot.fetchUserMediaUrl(media_id);
console.log(response);
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

## Template Management

This section provides the usage of Template management

### Usage

```javascript
const { ManageWhatsapp } = require("whatsapp-bot-builder");
const whatsappManager = new ManageWhatsapp({
  webhook_verify_token: ["Your Verification Token"], //used to authenticate whatsapp webhook
  meta_version: ["META API Version"], //Defaults to v16.0
  whatsapp_buisness_id: ["WhatsApp Business Account ID"],
  buisness_phone_number: ["Phone number ID"],
  meta_access_token: ["Meta Access Token"],
});
```

### Create Template

```javascript
// Creating a new WhatsApp template
const newTemplate = await whatsappManager.createTemplate({
  name: "new_template",
  category: "MARKETING",
  language: "en_US",
  components: [
    {
      type: "BODY",
      text: "This is a sample",
    },
  ],
});
console.log("Created Template:", newTemplate);
```

### Fetching Templates

```javascript
// Fetching WhatsApp templates
const fetchedTemplates = await whatsappManager.fetchTemplates({
  category: "MARKETING",
  status: "APPROVED",
});
console.log("Fetched Templates:", fetchedTemplates);
```

### Edit Template

```javascript
// Editing an existing WhatsApp template
const editedTemplate = await whatsappManager.editTemplate("12345678", {
  category: "Updated Category",
  components: [{ type: "HEADER", text: "Updated Header" }],
});
console.log("Edited Template:", editedTemplate);
```

### Delete Template

```javascript
// Deleting an existing WhatsApp template
const deletionResult = await whatsappManager.deleteTemplate(
  "12345678",
  "Template Name"
);
console.log("Deletion Result:", deletionResult);
console.log("Edited Template:", editedTemplate);
```
