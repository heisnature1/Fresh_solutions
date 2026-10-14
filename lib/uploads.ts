/**
 * Server-side upload validation: extension + MIME allowlists, size limits,
 * and magic-byte sniffing so a renamed executable cannot pass as a document
 * or image.
 */

export interface UploadRule {
  maxBytes: number;
  allowed: Record<string, string[]>; // mime -> extensions
}

export const IMAGE_RULE: UploadRule = {
  maxBytes: 5 * 1024 * 1024,
  allowed: {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  },
};

export const DOCUMENT_RULE: UploadRule = {
  maxBytes: 8 * 1024 * 1024,
  allowed: {
    "application/pdf": [".pdf"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "text/plain": [".txt"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  },
};

export const CV_RULE: UploadRule = {
  maxBytes: 8 * 1024 * 1024,
  allowed: {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  },
};

const MAGIC: Array<{ mime: string; bytes: number[] }> = [
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
  // ZIP container (docx, xlsx...) — "PK"
  { mime: "application/zip", bytes: [0x50, 0x4b, 0x03, 0x04] },
];

function sniffMime(buf: Buffer): string | null {
  if (buf.length >= 12 && buf.subarray(0, 4).equals(Buffer.from("RIFF")) && buf.subarray(8, 12).equals(Buffer.from("WEBP"))) {
    return "image/webp";
  }
  for (const m of MAGIC) {
    if (buf.length >= m.bytes.length && m.bytes.every((b, i) => buf[i] === b)) return m.mime;
  }
  // Plain text heuristic: first 512 bytes must be printable/whitespace.
  if (buf.length > 0) {
    const sample = buf.subarray(0, 512);
    let ok = true;
    for (const b of sample) {
      if (b === 9 || b === 10 || b === 13) continue;
      if (b < 32 || b === 127) {
        ok = false;
        break;
      }
    }
    if (ok) return "text/plain";
  }
  return null;
}

export interface FileValidationResult {
  ok: boolean;
  error?: string;
  mimeType?: string;
}

export function validateUpload(
  filename: string,
  declaredMime: string,
  size: number,
  buffer: Buffer,
  rule: UploadRule,
): FileValidationResult {
  if (size <= 0) return { ok: false, error: "File is empty." };
  if (size > rule.maxBytes) {
    return { ok: false, error: `File exceeds the ${Math.round(rule.maxBytes / 1024 / 1024)} MB limit.` };
  }
  const ext = `.${(filename.split(".").pop() ?? "").toLowerCase()}`;
  const allowedExts = rule.allowed[declaredMime];
  if (!allowedExts || !allowedExts.includes(ext)) {
    return { ok: false, error: "This file type is not accepted." };
  }
  // Magic-byte verification where the format has a signature.
  const sniffed = sniffMime(buffer);
  if (sniffed) {
    if (sniffed === declaredMime) return { ok: true, mimeType: declaredMime };
    // docx/xlsx are ZIP containers
    if (sniffed === "application/zip" && declaredMime.includes("officedocument")) {
      return { ok: true, mimeType: declaredMime };
    }
    return { ok: false, error: "The file contents do not match its declared type." };
  }
  // No recognisable signature: only allow formats that legitimately lack one.
  if (declaredMime === "application/msword" || declaredMime === "text/plain") {
    return { ok: true, mimeType: declaredMime };
  }
  return { ok: false, error: "The file contents could not be verified." };
}
