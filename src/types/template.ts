type Category = "AUTHENTICATION" | "MARKETING" | "UTILITY";

type LanguageCode =
  | "af"
  | "sq"
  | "ar"
  | "az"
  | "bn"
  | "bg"
  | "ca"
  | "zh_CN"
  | "zh_HK"
  | "zh_TW"
  | "hr"
  | "cs"
  | "da"
  | "nl"
  | "en"
  | "en_GB"
  | "en_US"
  | "et"
  | "fil"
  | "fi"
  | "fr"
  | "ka"
  | "de"
  | "el"
  | "gu"
  | "ha"
  | "he"
  | "hi"
  | "hu"
  | "id"
  | "ga"
  | "it"
  | "ja"
  | "kn"
  | "kk"
  | "rw_RW"
  | "ko"
  | "ky_KG"
  | "lo"
  | "lv"
  | "lt"
  | "mk"
  | "ms"
  | "ml"
  | "mr"
  | "nb"
  | "fa"
  | "pl"
  | "pt_BR"
  | "pt_PT"
  | "pa"
  | "ro"
  | "ru"
  | "sr"
  | "sk"
  | "sl"
  | "es"
  | "es_AR"
  | "es_ES"
  | "es_MX"
  | "sw"
  | "sv"
  | "ta"
  | "te"
  | "th"
  | "tr"
  | "uk"
  | "ur"
  | "uz"
  | "vi"
  | "zu";

type TemplateStatus =
  | "APPROVED"
  | "IN_APPEAL"
  | "PENDING"
  | "REJECTED"
  | "PENDING_DELETION"
  | "DELETED"
  | "DISABLED"
  | "PAUSED"
  | "LIMIT_EXCEEDED";

interface TemplateButtonComponent {
  type: "PHONE_NUMBER" | "URL" | "QUICK_REPLY" | "COPY_CODE";
  text: string;
  /** Applicable only when type is PHONE_NUMBER  */
  phone_number?: string;
  url?: string;
  /**
   * Optional example data.
   * Required if the url, copy_code string contains variables.
   */
  example?: Array<string>;
}

interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  /**
   * Location headers can only be used in templates categorized as UTILITY or MARKETING. Real-time locations are not supported.
   */
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION";
  text?: string;
  buttons?: Array<TemplateButtonComponent>;
  url?: string;
  /**
   * Optional example data.
   * Required if the text string contains variables.
   */
  example?: {
    header_text?: Array<string>;
    /**
     * Uploaded media asset handle. Use the Resumable Upload API to generate an asset handle.
     */
    header_handle?: Array<string>;
    body_text?: Array<Array<string>>;
  };
}

export interface WhatsappTemplate {
  name: string;
  category: Category;
  allow_category_change?: boolean;
  language: LanguageCode;
  components: Array<TemplateComponent>;
  id?: string;
  status?: TemplateStatus;
}

export interface WhatsappTemplateParameters
  extends Partial<
    Pick<WhatsappTemplate, "name" | "language" | "category" | "status">
  > {
  rejected_reason?: string;
  name_or_content?: string;
  content?: string;
}

export interface TemplatePaging {
  cursors: {
    before: string;
    after: string;
  };
  next: string;
}
