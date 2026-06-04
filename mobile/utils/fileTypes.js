export function getFileType(
  fileName
) {

  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();

  // DOCUMENTI + CODICE
  if (
    [
      // documenti
      "pdf",
      "doc",
      "docx",
      "txt",
      "rtf",
      "odt",

      // spreadsheet
      "xlsx",
      "xls",
      "csv",

      // presentazioni
      "ppt",
      "pptx",

      // markdown
      "md",

      // javascript/typescript
      "js",
      "jsx",
      "ts",
      "tsx",

      // python
      "py",

      // compilati
      "java",
      "c",
      "cpp",
      "cs",

      // web
      "html",
      "css",

      // dati/config
      "json",
      "xml",
      "sql",

      // shell
      "sh",
      "bash",

      // config
      "yml",
      "yaml",
    ].includes(
      extension
    )
  ) {
    return "document";
  }

  // IMMAGINI
  if (
    [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "heic",
    ].includes(
      extension
    )
  ) {
    return "image";
  }

  // VIDEO
  if (
    [
      "mp4",
      "mov",
      "avi",
      "mkv",
      "webm",
    ].includes(
      extension
    )
  ) {
    return "video";
  }

  // AUDIO
  if (
    [
      "mp3",
      "wav",
      "aac",
      "flac",
      "ogg",
    ].includes(
      extension
    )
  ) {
    return "audio";
  }

  return "other";
}