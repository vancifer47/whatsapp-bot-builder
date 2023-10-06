import { Request, Response } from "express";
import axios, { Axios } from "axios";
import {
  callbackProps,
  MetaWebhookMessage,
  metaWebhookAuthenticatePayload,
} from "./bot";
import { messageBodyParser } from "./message_parser";

interface botBuilderProps {
  base_url: string;
  webhook_verify_token: string;
  meta_version: string;
  whatsapp_buisness_id: string;
  buisness_phone_number: string;
  meta_access_token: string;
}

const constructBodyParams = (to: string, type: string, bodyItems: any) => {
  let bodyParams = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: type,
    [type]: bodyItems,
  };
  return bodyParams;
};

export class whatsappBotBuilder implements botBuilderProps {
  base_url: string;
  meta_version: string;
  webhook_verify_token: string;
  whatsapp_buisness_id: string;
  buisness_phone_number: string;
  meta_access_token: string;

  axiosInstance: Axios;

  private listener: any = {};

  constructor(params: botBuilderProps) {
    [
      "webhook_verify_token",
      "whatsapp_buisness_id",
      "buisness_phone_number",
      "meta_access_token",
    ].forEach((i) => {
      if (!params[i]) {
        throw new Error(`${i} is mandatory!`);
      }
    });
    this.webhook_verify_token = params.webhook_verify_token;
    this.meta_version = params.meta_version || "v16.0";
    this.whatsapp_buisness_id = params.whatsapp_buisness_id;
    this.buisness_phone_number = params.buisness_phone_number;
    this.meta_access_token = params.meta_access_token;
    this.base_url = `https://graph.facebook.com/${this.meta_version}/${this.buisness_phone_number}`;
    this.axiosInstance = axios.create({
      baseURL: this.base_url,
      headers: {
        Authorization: `Bearer ${this.meta_access_token}`,
      },
    });
  }

  async markMessageAsRead(message_id: string) {
    if (!message_id) {
      return;
    }
    try {
      await this.axiosInstance.post("/messages", {
        messaging_product: "whatsapp",
        status: "read",
        message_id,
      });
    } catch (error) {
      let msg = error?.error_data?.details;
      if (msg && msg.includes("last-seen message in this conversation")) {
        return {
          status: "success",
          data: { success: false, error: msg },
        };
      } else {
        return {
          status: "failed",
          error,
        };
      }
    }
  }

  async sendWhatsappMessage(to: string, messageBody: object) {
    try {
      let bodyParams = constructBodyParams(to, "text", messageBody);
      await this.axiosInstance.post("/messages", bodyParams);
    } catch (error) {
      throw error;
    }
  }

  async sendWhatsappTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    templateComponents?: any
  ) {
    try {
      let bodyParams = constructBodyParams(to, "template", {
        name: templateName,
        language: {
          code: languageCode,
        },
        components: templateComponents,
      });
      await this.axiosInstance.post("/messages", bodyParams);
    } catch (error) {
      throw error;
    }
  }

  async fetchUserMediaUrl(media_id: string) {
    const response = await this.axiosInstance.get(
      this.base_url.replace(this.buisness_phone_number, media_id)
    );
    if (response.status == 200) {
      return response.data;
    }
  }

  addListener(
    type: string,
    message_id: string | undefined,
    callback: (params: callbackProps) => void
  ) {
    try {
      if (!this.listener.hasOwnProperty(type)) {
        this.listener[type] = {};
      }
      if (message_id) {
        if (Object.keys(this.listener[type]).includes(message_id)) {
          throw new Error(`${message_id} handler already exists`);
        }
        this.listener[type][message_id] = callback;
      } else {
        this.listener[type] = callback;
      }
    } catch (error) {
      throw error;
    }
  }

  text(message: string, callback: (params: callbackProps) => void) {
    try {
      this.addListener("text", message, callback);
    } catch (error) {
      throw error;
    }
  }

  image(callback: (params: callbackProps) => void) {
    try {
      this.addListener("image", null, callback);
    } catch (error) {
      throw error;
    }
  }

  document(callback: (params: callbackProps) => void) {
    try {
      this.addListener("image", null, callback);
    } catch (error) {
      throw error;
    }
  }

  button(payload: string, callback: (params: callbackProps) => void) {
    this.addListener("button", payload, callback);
  }

  private verfiyWhatsappToken(
    payload: metaWebhookAuthenticatePayload,
    res: Response
  ) {
    let { webhook_verify_token } = this;
    if (
      !payload["hub.mode"] ||
      !payload["hub.verify_token"] ||
      !payload["hub.challenge"]
    ) {
      res.sendStatus(403);
      return;
    }
    if (
      payload["hub.mode"] === "subscribe" &&
      payload["hub.verify_token"] === webhook_verify_token
    ) {
      // eslint-disable-next-line no-console
      console.log("✔️ Webhook verified");
      res.send(payload["hub.challenge"]);
      return;
    }
  }

  private async botListener(req: Request) {
    try {
      let data = await messageBodyParser(
        req.body as MetaWebhookMessage,
        this.whatsapp_buisness_id
      );
      if (data.isNotificationMessage) {
        return;
      }
      if (data.isMessage) {
        let {
          type,
          from: { phone },
        } = data.message;
        await this.markMessageAsRead(data.message.id);
        if (["image", "document"].includes(type)) {
          if (this.listener?.[type]) {
            await this.listener[type]({
              sender: phone,
              data: data.message,
            });
            return;
          }
        }
        let listener_id;
        if (type == "text") {
          listener_id = data.message.text.body;
        } else if (type == "button") {
          listener_id = data.message.button.payload;
        }
        if (listener_id && this.listener[type][listener_id]) {
          await this.listener[type][listener_id]({
            sender: phone,
            data: data.message,
          });
        } else {
          this.sendWhatsappMessage(phone, {
            preview_url: false,
            body: "Seems like a bad input, Please try again!",
          });
        }
      }
    } catch (error) {
      throw error;
    }
  }

  init() {
    let _this = this;
    console.info("Webhook configured and initialized! 😃");
    return async function (
      req: Request,
      res: Response,
      next: Function = () => {}
    ) {
      try {
        if (req.method == "GET") {
          let webhookPayload =
            req.query as unknown as metaWebhookAuthenticatePayload;
          return _this.verfiyWhatsappToken(webhookPayload, res);
        }
        if (req.method == "POST") {
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
          console.log(JSON.stringify(req.body));
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
          await _this.botListener(req);
        }
        res.sendStatus(200);
      } catch (error: any) {
        console.log(error);
        res.status(500).send({ error: true });
      }
      next();
    };
  }
}
