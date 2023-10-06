export interface callbackProps {
  sender: string;
  data?: any;
}

export interface metaWebhookAuthenticatePayload {
  "hub.mode": string;
  "hub.verify_token": string;
  "hub.challenge": number;
}

// Define a contact profile interface
interface ContactProfile {
  name: string;
}

// Define a message interface
export interface Message {
  from: string | any;
  id: string;
  timestamp: string;
  type: string;
  text: {
    body: string;
  };
  button?: {
    payload: string;
    text: string;
  };
  interactive?: {
    type: string;
    list_reply?: string;
    button_reply?: string;
  };
  list_reply?: string;
  button_reply?: string;
  context?: any;
  errors?: any;
}

// Define a changes field interface
interface ChangesField {
  value: {
    messaging_product: "whatsapp";
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    contacts: {
      profile: ContactProfile;
      wa_id: string;
    }[];
    messages: Message[];
    statuses: any;
  };
  field: "messages";
}

// Define an entry interface
interface Entry {
  id: string;
  changes: ChangesField[];
}

// Define the metaWebhookMessage interface
export interface MetaWebhookMessage {
  object: "whatsapp_business_account";
  entry: Entry[];
}
