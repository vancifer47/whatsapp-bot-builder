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
    list_reply?: {
      id: string;
      title: string;
    };
    button_reply?: {
      id: string;
      title: string;
    };
  };
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

export interface botBuilderProps {
  base_url?: string;
  webhook_verify_token: string;
  meta_version?: string;
  whatsapp_buisness_id: string;
  buisness_phone_number: string;
  meta_access_token: string;
}
