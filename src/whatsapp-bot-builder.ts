import { Request, Response } from "express";
import axios, { Axios } from "axios";
import {
  botBuilderProps,
  callbackProps,
  MetaWebhookMessage,
  metaWebhookAuthenticatePayload,
} from "@types";
import { messageBodyParser } from "./message_parser";
import FormData from "form-data"
import { createReadStream } from "fs";
import { stat } from "fs/promises"
import { lookup, extension } from "mime-types"
import { SUPPORTED_MEDIA_TYPES } from "utils";

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

  protected axiosInstance: Axios;

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
    this.base_url = `https://graph.facebook.com/${this.meta_version}`;
    this.axiosInstance = axios.create({
      baseURL: this.base_url,
      headers: {
        Authorization: `Bearer ${this.meta_access_token}`,
      },
    });
    console.info("Webhook configured and initialized! 😃");
  }

  async markMessageAsRead(message_id: string) {
    if (!message_id) {
      return;
    }
    try {
      await this.axiosInstance.post(`/${this.buisness_phone_number}/messages`, {
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
      await this.axiosInstance.post(
        `/${this.buisness_phone_number}/messages`,
        bodyParams
      );
    } catch (error) {
      throw error;
    }
  }

  async sendWhatsappDocument(to: string, messageBody: object, isSticker: Boolean = false) {
    try {
      let bodyParams = constructBodyParams(to, isSticker ? "sticker" : "document", messageBody);
      await this.axiosInstance.post(
        `/${this.buisness_phone_number}/messages`,
        bodyParams
      );
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
      await this.axiosInstance.post(
        `/${this.buisness_phone_number}/messages`,
        bodyParams
      );
    } catch (error) {
      throw error;
    }
  }

  async sendInteractiveMessage(to: string, interactiveComponents: any) {
    try {
      let bodyParams = constructBodyParams(
        to,
        "interactive",
        interactiveComponents
      );
      await this.axiosInstance.post(
        `/${this.buisness_phone_number}/messages`,
        bodyParams
      );
    } catch (error) {
      throw error;
    }
  }

  async uploadMedia(filePath: string, isWebpAnimated: boolean = false) {
    const file = createReadStream(filePath)
    const fileType = lookup(filePath)
    const fileExtension = extension(fileType)
    let { mimeType, maxSize } = SUPPORTED_MEDIA_TYPES[`.${fileExtension}`]
    const inputParams = new FormData()
    inputParams.append("file", file)
    inputParams.append("type", mimeType)
    inputParams.append('messaging_product', 'whatsapp')
    if (typeof maxSize == "object") {
      maxSize = isWebpAnimated ? maxSize?.animated : maxSize.static
    }
    try {
      const { size } = await stat(filePath)
      if (size > maxSize) {
        throw new Error(`Size of the file with type ${mimeType} cannot exceed ${size / 1024} MB`)
      }
      const response = await this.axiosInstance.post(`/${this.buisness_phone_number}/media`, inputParams, {
        headers: {
          ...this.axiosInstance.defaults.headers.common,
          ...inputParams.getHeaders(),
        }
      });
      if (response.status == 200) {
        return response.data;
      }
    } catch (error) {
      throw error
    }
  }

  async fetchUserMediaUrl(media_id: string) {
    const response = await this.axiosInstance.get(`/${media_id}`);

    if (response.status == 200) {
      return response.data;
    }
  }

  private addListener(
    type:
      | "text"
      | "image"
      | "document"
      | "button"
      | "interactive_button"
      | "interactive_radio"
      | "DEFAULT"
      | "ERROR",
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

  /**
   * This listens to inbound unique text payload
   * @param payload - String - This is text payload for eg., Hello
   * @param callback - Function ({sender,data}) Action to be performed once this listener is triggered
   */
  text(message: string, callback: (params: callbackProps) => void) {
    try {
      this.addListener("text", message, callback);
    } catch (error) {
      throw error;
    }
  }

  /**
   * This listens to inbound image, There can be only one instance of it
   * @param callback - Function ({sender,data}) Action to be performed once this listener is triggered
   */
  image(callback: (params: callbackProps) => void) {
    try {
      this.addListener("image", null, callback);
    } catch (error) {
      throw error;
    }
  }

  /**
   * This listens to inbound document, There can be only one instance of it
   * @param callback - Function ({sender,data}) Action to be performed once this listener is triggered
   */
  document(callback: (params: callbackProps) => void) {
    try {
      this.addListener("document", null, callback);
    } catch (error) {
      throw error;
    }
  }

  /**
   * This listens to inbound unique button payload
   * @param payload - String - This is button payload for eg., Home
   * @param callback - Function ({sender,data}) Action to be performed once this listener is triggered
   */
  button(payload: string, callback: (params: callbackProps) => void) {
    this.addListener("button", payload, callback);
  }

  /**
   * This listens to inbound unique radio_id of interactive message
   * @param payload - String - This is radio_id of interactive messages
   * @param callback - Function ({sender,data}) Action to be performed once this listener is triggered
   */
  interactive_radio(
    payload: string,
    callback: (params: callbackProps) => void
  ) {
    this.addListener("interactive_radio", payload, callback);
  }

  /**
   * This listens to inbound unique button_id of interactive message
   * @param payload - String - This is button_id of interactive messages
   * @param callback - Function ({sender,data}) Action to be performed once this listener is triggered
   */
  interactive_button(
    payload: string,
    callback: (params: callbackProps) => void
  ) {
    this.addListener("interactive_button", payload, callback);
  }

  /** Set's default response from the bot, This is triggered when no listeners match,
   * It's a Mandatory listener
   * @param callback - Function
   */
  default(callback: (params: callbackProps) => void) {
    this.addListener("DEFAULT", null, callback);
  }

  /** Set's error response from the bot, This is triggered when any error occurs,
   * It's a Mandatory listener
   * @param callback - Function
   */
  errorMessage(callback: (params: callbackProps) => void) {
    this.addListener("ERROR", null, callback);
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
      res.status(403).send("Forbidden!");
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
    let sender_phone_number: string;
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
        sender_phone_number = phone;
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
        switch (type) {
          case "text":
            listener_id = data.message.text.body;
            break;
          case "button":
            listener_id = data.message.button.payload;
            break;
          case "interactive_radio":
            listener_id = data.message.interactive.list_reply.id;
            break;
          case "interactive_button":
            listener_id = data.message.interactive.button_reply.id;
            break;
          default:
            break;
        }

        if (listener_id && this.listener[type][listener_id]) {
          await this.listener[type][listener_id]({
            sender: phone,
            data: data.message,
          });
        } else {
          await this.listener?.DEFAULT({
            sender: phone,
          });
        }
      }
    } catch (error) {
      await this.listener?.ERROR({
        sender: sender_phone_number,
      });
      throw error;
    }
  }

  init() {
    let _this = this;
    if (!_this.listener?.DEFAULT) {
      throw new Error(`default handler is required!`);
    }
    if (!_this.listener?.ERROR) {
      throw new Error(`errorMessage handler is required!`);
    }
    return async function (
      req: Request,
      res: Response,
      next: Function = () => { }
    ) {
      try {
        if (req.method == "GET") {
          let webhookPayload =
            req.query as unknown as metaWebhookAuthenticatePayload;
          return _this.verfiyWhatsappToken(webhookPayload, res);
        }
        if (req.method == "POST") {
          await _this.botListener(req);
        }
        res.status(200).send("Success!");
      } catch (error: any) {
        res.status(500).send({
          error: error.message ?? error.data.message ?? JSON.stringify(error),
        });
      }
      next();
    };
  }
}
