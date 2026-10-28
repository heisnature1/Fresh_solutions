import fs from "node:fs";
import path from "node:path";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, RGB } from "pdf-lib";

/** Small cursor-based layout engine on top of pdf-lib for brand documents. */

const NAVY = rgb(10 / 255, 22 / 255, 51 / 255);
const BLUE = rgb(37 / 255, 99 / 255, 235 / 255);
const SLATE = rgb(51 / 255, 65 / 255, 92 / 255);
const MUTED = rgb(107 / 255, 122 / 255, 153 / 255);
const LINE = rgb(227 / 255, 232 / 255, 242 / 255);
const LIGHT_BG = rgb(244 / 255, 246 / 255, 251 / 255);
const WHITE = rgb(1, 1, 1);

const PAGE_W = 595.28; // A4
const PAGE_H = 841.89;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

export class PdfBuilder {
  private doc!: PDFDocument;
  private font!: PDFFont;
  private bold!: PDFFont;
  private pages: PDFPage[] = [];
  private page!: PDFPage;
  private y = 0;
  private companyLines: string[] = [];
  private logoPng: Uint8Array | null = null;
  docTitle = "Document";

  static async create(opts: {
    docTitle: string;
    company?: { name: string; email?: string; phone?: string; location?: string };
  }): Promise<PdfBuilder> {
    const b = new PdfBuilder();
    b.docTitle = opts.docTitle;
    b.doc = await PDFDocument.create();
    b.doc.setTitle(opts.docTitle);
    b.doc.setAuthor(opts.company?.name ?? "Fresh Solutions");
    b.font = await b.doc.embedFont(StandardFonts.Helvetica);
    b.bold = await b.doc.embedFont(StandardFonts.HelveticaBold);
    const c = opts.company;
    b.companyLines = [c?.email, c?.phone, c?.location].filter(Boolean) as string[];

    // Optional company brand mark for the header.
    try {
      const p = path.join(process.cwd(), "public", "brand", "logo-mark.png");
      if (fs.existsSync(p)) b.logoPng = new Uint8Array(fs.readFileSync(p));
    } catch {
      /* header falls back to typographic wordmark */
    }
    b.addPage();
    return b;
  }

  private addPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.pages.push(this.page);
    this.y = PAGE_H - MARGIN;
  }

  /** Renders the brand header band and moves the cursor below it. */
  async header(title: string, refLabel: string, ref: string, dateLabel: string, date: string) {
    const bandH = 84;
    this.page.drawRectangle({ x: 0, y: PAGE_H - bandH, width: PAGE_W, height: bandH, color: NAVY });
    this.page.drawRectangle({ x: 0, y: PAGE_H - bandH - 3, width: PAGE_W, height: 3, color: BLUE });

    let textX = MARGIN;
    if (this.logoPng) {
      try {
        const img = await this.doc.embedPng(this.logoPng);
        const h = 44;
        const w = (img.width / img.height) * h;
        this.page.drawImage(img, { x: MARGIN, y: PAGE_H - bandH + (bandH - h) / 2, width: w, height: h });
        textX = MARGIN + w + 14;
      } catch {
        /* typographic header only */
      }
    }
    this.page.drawText("FRESH SOLUTIONS", { x: textX, y: PAGE_H - 40, size: 16, font: this.bold, color: WHITE });
    this.page.drawText("Engineering the Future. Empowering Progress.", {
      x: textX,
      y: PAGE_H - 56,
      size: 8.5,
      font: this.font,
      color: rgb(0.62, 0.7, 0.85),
    });
    this.page.drawText(title.toUpperCase(), {
      x: PAGE_W - MARGIN - this.bold.widthOfTextAtSize(title.toUpperCase(), 13),
      y: PAGE_H - 44,
      size: 13,
      font: this.bold,
      color: WHITE,
    });

    this.y = PAGE_H - bandH - 26;
    // Meta row: reference + date
    this.page.drawText(refLabel, { x: MARGIN, y: this.y, size: 8, font: this.font, color: MUTED });
    this.page.drawText(ref, { x: MARGIN + 90, y: this.y, size: 10, font: this.bold, color: SLATE });
    const dateW = this.font.widthOfTextAtSize(dateLabel, 8);
    this.page.drawText(dateLabel, { x: PAGE_W - MARGIN - dateW - 130, y: this.y, size: 8, font: this.font, color: MUTED });
    this.page.drawText(date, { x: PAGE_W - MARGIN - this.bold.widthOfTextAtSize(date, 10), y: this.y, size: 10, font: this.bold, color: SLATE });
    this.y -= 22;
    if (this.companyLines.length) {
      this.y -= 4;
      this.page.drawText(this.companyLines.join("   ·   "), { x: MARGIN, y: this.y + 10, size: 8, font: this.font, color: MUTED });
      this.y -= 10;
    }
  }

  private ensureSpace(height: number) {
    if (this.y - height < MARGIN + 40) this.addPage();
  }

  space(h: number) {
    this.y -= h;
  }

  sectionLabel(text: string) {
    this.ensureSpace(30);
    this.y -= 6;
    this.page.drawText(text.toUpperCase(), { x: MARGIN, y: this.y, size: 9, font: this.bold, color: BLUE });
    this.y -= 6;
    this.page.drawLine({ start: { x: MARGIN, y: this.y }, end: { x: PAGE_W - MARGIN, y: this.y }, thickness: 0.7, color: LINE });
    this.y -= 10;
  }

  kvGrid(rows: Array<[string, string][]>) {
    const colW = CONTENT_W / 2;
    for (const row of rows) {
      this.ensureSpace(30);
      row.forEach(([label, value], i) => {
        const x = MARGIN + i * colW;
        this.page.drawText(label, { x, y: this.y, size: 8, font: this.font, color: MUTED });
        const lines = this.wrap(value || "—", 10, colW - 12, this.font);
        let yy = this.y - 13;
        for (const line of lines) {
          this.page.drawText(line, { x, y: yy, size: 10, font: this.font, color: SLATE });
          yy -= 12;
        }
        this.lastRowH = Math.max(this.lastRowH, 13 + lines.length * 12);
      });
      this.y -= this.lastRowH + 6;
      this.lastRowH = 13 + 12;
    }
  }
  private lastRowH = 25;

  paragraph(text: string, opts: { size?: number; color?: RGB } = {}) {
    const size = opts.size ?? 10;
    const color = opts.color ?? SLATE;
    const lines = this.wrap(text || "—", size, CONTENT_W, this.font);
    for (const line of lines) {
      this.ensureSpace(size + 6);
      this.page.drawText(line, { x: MARGIN, y: this.y - size, size, font: this.font, color });
      this.y -= size + 4;
    }
    this.y -= 4;
  }

  bullets(items: string[]) {
    for (const item of items) {
      const lines = this.wrap(item, 10, CONTENT_W - 16, this.font);
      this.ensureSpace(16);
      this.page.drawText("•", { x: MARGIN, y: this.y - 10, size: 10, font: this.bold, color: BLUE });
      let yy = this.y - 10;
      for (const line of lines) {
        this.page.drawText(line, { x: MARGIN + 14, y: yy, size: 10, font: this.font, color: SLATE });
        yy -= 13;
      }
      this.y = yy - 2;
    }
    this.y -= 4;
  }

  table(columns: { header: string; width: number; align?: "left" | "right" }[], rows: string[][]) {
    const widths = columns.map((c) => c.width);
    const totalW = widths.reduce((a, b) => a + b, 0);
    const scale = CONTENT_W / totalW;

    const drawRow = (cells: string[], isHeader: boolean) => {
      const font = isHeader ? this.bold : this.font;
      const size = isHeader ? 8.5 : 9.5;
      const wrapped = cells.map((cell, i) => this.wrap(cell, size, widths[i] * scale - 14, font));
      const rowH = Math.max(...wrapped.map((w) => w.length)) * (size + 3) + 12;
      this.ensureSpace(rowH + 6);
      if (isHeader) {
        this.page.drawRectangle({ x: MARGIN, y: this.y - rowH, width: CONTENT_W, height: rowH, color: LIGHT_BG });
      }
      let x = MARGIN;
      cells.forEach((_, i) => {
        const colWNow = widths[i] * scale;
        let yy = this.y - size - 5;
        for (const line of wrapped[i]) {
          const w = font.widthOfTextAtSize(line, size);
          const tx = columns[i].align === "right" ? x + colWNow - 8 - w : x + 8;
          this.page.drawText(line, { x: tx, y: yy, size, font, color: SLATE });
          yy -= size + 3;
        }
        x += colWNow;
      });
      this.page.drawLine({ start: { x: MARGIN, y: this.y - rowH }, end: { x: PAGE_W - MARGIN, y: this.y - rowH }, thickness: 0.5, color: LINE });
      this.y -= rowH;
    };

    this.ensureSpace(40);
    drawRow(columns.map((c) => c.header), true);
    for (const r of rows) drawRow(r, false);
    this.y -= 10;
  }

  totalsBox(rows: [string, string][], grand: [string, string], currencyNote?: string) {
    const boxW = 240;
    const x = PAGE_W - MARGIN - boxW;
    const rowH = 18;
    const h = rows.length * rowH + rowH + 12;
    this.ensureSpace(h + 10);
    let yy = this.y;
    this.page.drawRectangle({ x, y: yy - h, width: boxW, height: h, color: LIGHT_BG });
    rows.forEach(([label, value], i) => {
      const ry = yy - rowH * (i + 1) + 5;
      this.page.drawText(label, { x: x + 12, y: ry, size: 9.5, font: this.font, color: SLATE });
      this.page.drawText(value, { x: x + boxW - 12 - this.font.widthOfTextAtSize(value, 9.5), y: ry, size: 9.5, font: this.font, color: SLATE });
    });
    this.page.drawLine({ start: { x, y: yy - rows.length * rowH }, end: { x: x + boxW, y: yy - rows.length * rowH }, thickness: 0.8, color: LINE });
    const gy = yy - h + 4;
    this.page.drawText(grand[0], { x: x + 12, y: gy, size: 11, font: this.bold, color: NAVY });
    this.page.drawText(grand[1], { x: x + boxW - 12 - this.bold.widthOfTextAtSize(grand[1], 11), y: gy, size: 11, font: this.bold, color: NAVY });
    this.y = yy - h - 8;
    if (currencyNote) {
      this.page.drawText(currencyNote, { x: PAGE_W - MARGIN - this.font.widthOfTextAtSize(currencyNote, 7.5), y: this.y, size: 7.5, font: this.font, color: MUTED });
      this.y -= 14;
    }
  }

  private wrap(text: string, size: number, maxWidth: number, font: PDFFont): string[] {
    const out: string[] = [];
    for (const rawLine of String(text).split(/\r?\n/)) {
      let line = "";
      for (const word of rawLine.split(/\s+/).filter(Boolean)) {
        const candidate = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
          line = candidate;
        } else {
          if (line) out.push(line);
          // Hard-break very long words
          if (font.widthOfTextAtSize(word, size) > maxWidth) {
            let chunk = "";
            for (const ch of word) {
              if (font.widthOfTextAtSize(chunk + ch, size) <= maxWidth) chunk += ch;
              else {
                out.push(chunk);
                chunk = ch;
              }
            }
            line = chunk;
          } else {
            line = word;
          }
        }
      }
      out.push(line);
    }
    return out.length ? out : [""];
  }

  async build(footerNote: string): Promise<Uint8Array> {
    // Footer on every page: note + page numbers + confidentiality hint.
    const total = this.pages.length;
    this.pages.forEach((p, i) => {
      p.drawLine({ start: { x: MARGIN, y: 40 }, end: { x: PAGE_W - MARGIN, y: 40 }, thickness: 0.5, color: LINE });
      p.drawText(footerNote, { x: MARGIN, y: 28, size: 7.5, font: this.font, color: MUTED });
      const label = `Page ${i + 1} of ${total}`;
      p.drawText(label, { x: PAGE_W - MARGIN - this.font.widthOfTextAtSize(label, 7.5), y: 28, size: 7.5, font: this.font, color: MUTED });
      p.drawText("Fresh Solutions · Confidential", { x: MARGIN, y: 18, size: 7, font: this.font, color: rgb(0.75, 0.79, 0.86) });
    });
    return this.doc.save();
  }
}
