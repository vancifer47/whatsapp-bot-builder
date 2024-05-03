import {
  TemplatePaging,
  WhatsappTemplate,
  WhatsappTemplateParameters,
} from "@types";
import { whatsappBotBuilder } from "./whatsapp-bot-builder";

const paramaterRegex = new RegExp(/{{\d+}}/, "g");

export class ManageWhatsapp extends whatsappBotBuilder {
  protected preValidation(
    params: Partial<WhatsappTemplate>,
    isTemplateEditing?: boolean
  ): Boolean {
    const validateTextLength = (
      text: string,
      maxLength: number,
      errorMessage: string
    ) => {
      if (text.length > maxLength) {
        throw new Error(errorMessage);
      }
    };

    const validateComponentText = (item: any) => {
      const paramaterRegex = /{{[a-zA-Z0-9_]+}}/g;
      const matches = item.text.match(paramaterRegex);
      if (matches && matches.length > 0) {
        if (item.example && item.example.length !== matches.length) {
          throw new Error(
            `The example must contain as many variables as there are in the text.`
          );
        }
      }
    };

    try {
      if (!isTemplateEditing) {
        validateTextLength(
          params.name,
          512,
          "Template Name cannot exceed 512 characters!"
        );
        if (!/^[a-z_]+$/.test(params.name)) {
          throw new Error(
            "Template name cannot have uppercase letters, only lowercase and underscores are allowed!"
          );
        }
      }

      params.components.forEach((item: any) => {
        switch (item.type) {
          case "HEADER":
            validateTextLength(
              item.text,
              60,
              "Template Header text cannot exceed 60 characters!"
            );
            validateComponentText(item);
            break;
          case "BODY":
            validateTextLength(
              item.text,
              1024,
              "Body text cannot exceed 1024 characters!"
            );
            validateComponentText(item);
            break;
          case "FOOTER":
            validateTextLength(
              item.text,
              60,
              "Template Footer text cannot exceed 60 characters!"
            );
            break;
          case "BUTTONS":
            if (item.buttons.length > 10) {
              throw new Error("Template cannot have more than 10 buttons!");
            }
            item.buttons.forEach((button: any) => {
              validateTextLength(
                button.text,
                25,
                "Template PhoneNumber button text cannot exceed 25 characters!"
              );
              switch (button.type) {
                case "PHONE_NUMBER":
                  validateTextLength(
                    button.phone_number,
                    20,
                    "Template PhoneNumber button number cannot exceed 20 characters!"
                  );
                  break;
                case "URL":
                  validateComponentText(button);
                  if (button.text.match(paramaterRegex).length !== 1) {
                    throw new Error(
                      "Template URL button supports only 1 variable, appended to the end of the URL string."
                    );
                  }
                  break;
              }
            });
            break;
        }
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a new WhatsApp template.
   * @async
   * @param {WhatsappTemplate} params - The parameters for creating the template.
   * @param {string} params.name - The name of the template.
   * @param {string} params.category - The category of the template.
   * @param {string} params.language - The language of the template.
   * @param {string} params.content - The content of the template.
   * @param {string} params.name_or_content - Either the name or content of the template.
   * @returns {Promise<Pick<WhatsappTemplate, "id" | "status" | "category">>} A Promise that resolves with an object containing the ID, status, and category of the created template.
   * @throws {Error} If an error occurs while creating the template.
   */
  async createTemplate(
    params: WhatsappTemplate
  ): Promise<Pick<WhatsappTemplate, "id" | "status" | "category">> {
    try {
      if (this.preValidation(params)) {
        let { data } = await this.axiosInstance.post(
          `${this.whatsapp_buisness_id}/message_templates`,
          params
        );
        return data;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetches all the templates based on the provided parameters.
   * @async
   * @function
   * @param {WhatsappTemplateParameters} params - Parameters for fetching templates.
   * @param {string} params.name - The name of the template.
   * @param {Category} params.category - The category of the template.
   * @param {LanguageCode} params.language - The language of the template.
   * @param {string} params.rejected_reason - The reason for rejection.
   * @param {TemplateStatus} params.status - The status of the template.
   * @param {string} params.name_or_content - The name or content of the template.
   * @param {string} params.content - The content of the template.
   * @param {number} [pageSize=25] - Size of the page to fetch.
   * @param {"before" | "after"} [pagingType] - Paging type ("before" or "after").
   * @param {string} [cursor] - Cursor for paging.
   * @returns {Promise<{ data: Array<WhatsappTemplate>; paging: TemplatePaging; }>} - The fetched templates along with paging information.
   * @throws {Error} - Throws an error if fetching fails.
   */
  async fetchTemplates(
    params: WhatsappTemplateParameters,
    pageSize: number = 25,
    pagingType?: "before" | "after",
    cursor?: string
  ): Promise<{
    data: Array<WhatsappTemplate>;
    paging: TemplatePaging;
  }> {
    try {
      let searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      searchParams.append("limit", pageSize.toString());
      if (pagingType && cursor) {
        searchParams.append(pagingType, cursor);
      }
      let { data } = await this.axiosInstance.get(
        `${
          this.whatsapp_buisness_id
        }/message_templates?${searchParams.toString()}`
      );
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Edits an existing WhatsApp template.
   * @async
   * @param {string} templateId - The ID of the template to edit.
   * @param {Pick<WhatsappTemplate, "category" | "components">} params - The parameters to update for the template.
   * @param {string} params.category - The category of the template.
   * @param {Component[]} params.components - The components of the template.
   * @returns {Promise<{success:boolean}>} A Promise that resolves with the edited template data.
   * @throws {Error} If an error occurs while editing the template.
   */
  async editTemplate(
    templateId: string,
    params: Partial<Pick<WhatsappTemplate, "category" | "components">>
  ): Promise<{ success: boolean }> {
    try {
      if (this.preValidation(params, true)) {
        let { data } = await this.axiosInstance.post(`/${templateId}`, params);
        return data;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes a WhatsApp template.
   * @async
   * @param {string} templateId - The ID of the template to delete.
   * @param {string} templateName - The name of the template to delete.
   * @returns {Promise<{ success: boolean }>} A Promise that resolves with an object indicating the success of the deletion.
   * @throws {Error} If an error occurs while deleting the template.
   */
  async deleteTemplate(
    templateId: string,
    templateName: string
  ): Promise<{ success: boolean }> {
    try {
      let searchParams = new URLSearchParams();
      searchParams.append("hsm_id", templateId);
      searchParams.append("name", templateName);
      let { data } = await this.axiosInstance.delete(
        `${
          this.whatsapp_buisness_id
        }/message_templates?${searchParams.toString()}`
      );
      return data;
    } catch (error) {
      throw error;
    }
  }
}
