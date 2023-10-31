import { MetaWebhookMessage, Message as IWhatsappMessage } from "./bot";

interface Message extends IWhatsappMessage {
  message_id?: string | null;
  type: string;
  from: {
    name: string | null;
    phone: string;
  };
  thread?: any;
}

interface ParsedMessage {
  isMessage: boolean;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts: {
    profile: {
      name: string;
    };
    wa_id: string;
  } | null;
  WABA_ID: string;
  message?: Message;
  isNotificationMessage?: boolean;
  notificationType?: string;
  notificationMessage?: NotificationMessage;
  errors?: any;
}

interface NotificationMessage {
  status: string;
  from: {
    name: null;
    phone: string;
  };
  errors?: any;
}

export function messageBodyParser(
  params: MetaWebhookMessage | undefined,
  currentWabaID: string
): ParsedMessage {
  if (!params) {
    throw new Error("params is required!");
  }

  const entry = params.entry?.[0];
  if (!entry) {
    throw new Error(
      'params is not a valid whatsapp message. Hint: check the "entry" property'
    );
  }

  const WABA_ID = entry.id;

  if (WABA_ID !== currentWabaID) {
    throw new Error(
      "WABA_ID is not valid. Hint: the message is not intended for this Whatsapp Business Account."
    );
  }

  if (params.object !== "whatsapp_business_account") {
    throw new Error(
      'params is not a valid whatsapp message. Hint: check the "object" property'
    );
  }

  const changes = entry.changes?.[0];
  if (!changes) {
    throw new Error(
      'params is not a valid whatsapp message. Hint: check the "changes" property'
    );
  }

  const { metadata, contacts, messages, statuses } = changes.value;
  // Messages vs Notifications
  const message = messages?.[0];
  const notificationMessage = statuses?.[0];

  const output: ParsedMessage = {
    isMessage: true,
    metadata,
    contacts: contacts?.[0] || null,
    WABA_ID,
  };

  if (notificationMessage) {
    output.isNotificationMessage = true;
    output.isMessage = false;
    output.notificationType = notificationMessage.status;
    output.notificationMessage = {
      status: notificationMessage.status,
      from: {
        name: null, // name is not available for notifications, it is only available for messages
        phone: notificationMessage.recipient_id,
      },
    };
  } else if (message) {
    output.isNotificationMessage = false;
    output.isMessage = true;
    let msgType: string = message.type;
    if (message.type == "interactive") {
      if (message.interactive?.type === "list_reply") {
        msgType = "radio_button";
        message.list_reply = message.interactive.list_reply;
      } else if (message.interactive?.type === "button_reply") {
        msgType = "simple_button";
        message.button_reply = message.interactive.button_reply;
      }
    }
    if (message.type == "unsupported") {
      msgType = "unknown_message";
      if (message.errors?.length) {
        output.isNotificationMessage = true;
        output.isMessage = false;
      }
    }

    if (msgType) {
      message.type = msgType;
      output.message = {
        ...message,
        from: {
          name: output.contacts?.profile.name || null,
          phone: message.from,
        },
      };
      output.message.message_id = message.id || null;
      if (output.isMessage && message.context) {
        output.message.thread = {
          from: {
            name: null,
            phone: message.context.from,
            message_id: message.context.id,
          },
        };
      }
    }
  } else {
    console.warn("An unidentified message.");
  }

  return output;
}
