export const SUPPORTED_MEDIA_TYPES: {
    [key: string]: {
        mimeType: string;
        maxSize: number | {
            animated: number,
            static: number
        };
    }
} = {
    ".aac": {
        mimeType: "audio/aac",
        maxSize: 16 * 1024 * 1024 // 16 MB in bytes
    },
    ".amr": {
        mimeType: "audio/amr",
        maxSize: 16 * 1024 * 1024 // 16 MB in bytes
    },
    ".mp3": {
        mimeType: "audio/mpeg",
        maxSize: 16 * 1024 * 1024 // 16 MB in bytes
    },
    ".m4a": {
        mimeType: "audio/mp4",
        maxSize: 16 * 1024 * 1024 // 16 MB in bytes
    },
    ".ogg": {
        mimeType: "audio/ogg",
        maxSize: 16 * 1024 * 1024 // 16 MB in bytes
    },
    ".txt": {
        mimeType: "text/plain",
        maxSize: 100 * 1024 * 1024 // 100 MB in bytes
    },
    ".xls": {
        mimeType: "application/vnd.ms-excel",
        maxSize: 100 * 1024 * 1024 // 100 MB in bytes
    },
    ".xlsx": {
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        maxSize: 100 * 1024 * 1024 // 100 MB in bytes
    },
    ".doc": {
        mimeType: "application/msword",
        maxSize: 100 * 1024 * 1024 // 100 MB in bytes
    },
    ".docx": {
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        maxSize: 100 * 1024 * 1024 // 100 MB in bytes
    },
    ".ppt": {
        mimeType: "application/vnd.ms-powerpoint",
        maxSize: 100 * 1024 * 1024 // 100 MB in bytes
    },
    ".pptx": {
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        maxSize: 100 * 1024 * 1024 // 100 MB in bytes
    },
    ".pdf": {
        mimeType: "application/pdf",
        maxSize: 100 * 1024 * 1024 // 100 MB in bytes
    },
    ".jpeg": {
        mimeType: "image/jpeg",
        maxSize: 5 * 1024 * 1024 // 5 MB in bytes
    },
    ".png": {
        mimeType: "image/png",
        maxSize: 5 * 1024 * 1024 // 5 MB in bytes
    },
    ".webp": {
        mimeType: "image/webp",
        maxSize: {
            animated: 500 * 1024,
            static: 100 * 1024
        }
    },
    ".3gp": {
        mimeType: "video/3gp",
        maxSize: 16 * 1024 * 1024 // 16 MB in bytes
    },
    ".mp4": {
        mimeType: "video/mp4",
        maxSize: 16 * 1024 * 1024 // 16 MB in bytes
    }
};
