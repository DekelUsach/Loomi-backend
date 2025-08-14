import mammoth from 'mammoth';
import fetch from 'node-fetch';
import { PDFDocument } from 'pdf-lib';
import Tesseract from 'tesseract.js';
import { fromBuffer } from 'pdf2pic';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

function cleanText(text) {
  return (text || '')
    .replace(/\u0000/g, ' ')
    .replace(/[\t\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function extractTextFromPdf(buffer, opts = {}) {
  const language = (opts.language || 'spa').toString();
  const minLength = Number.isFinite(opts.minLength) ? Number(opts.minLength) : 100;
  let extracted = '';
  try {
    const data = await pdfParse(buffer);
    extracted = cleanText(data.text || '');
    if (extracted && extracted.length >= minLength) {
      return extracted;
    }
  } catch (_) {}

  let numPages = 0;
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    numPages = pdfDoc.getPageCount();
  } catch (_) {}
  if (!Number.isFinite(numPages) || numPages <= 0) numPages = 1;

  const ocrText = await extractTextWithTesseract(buffer, numPages, language);
  if (ocrText && ocrText.length >= minLength) {
    return ocrText;
  }
  return ocrText || extracted || '';
}

export async function extractTextFromDocx(buffer) {
  try {
    const { value } = await mammoth.extractRawText({ buffer });
    return cleanText(value || '');
  } catch (_) {
    return '';
  }
}

export async function ocrSpaceExtract(buffer, contentType = 'application/pdf', language = 'spa') {
  const apiKey = process.env.OCR_SPACE_API_KEY || '';
  if (!apiKey) return '';
  const base64 = buffer.toString('base64');
  const params = new URLSearchParams();
  params.set('apikey', apiKey);
  params.set('language', language);
  params.set('isOverlayRequired', 'false');
  params.set('scale', 'true');
  params.set('OCREngine', '2');
  params.set('base64Image', `data:${contentType};base64,${base64}`);

  try {
    const res = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const json = await res.json();
    if (!json || json.IsErroredOnProcessing) {
      return '';
    }
    const parts = Array.isArray(json.ParsedResults)
      ? json.ParsedResults.map(p => p.ParsedText || '')
      : [];
    const result = cleanText(parts.join('\n'));
    return result;
  } catch (_) {
    return '';
  }
}

async function extractTextWithTesseract(buffer, numPages, language = 'spa') {
  try {
    await execFileAsync('gm', ['-version']);
  } catch (_) {
    return '';
  }
  const tempDir = path.join(process.cwd(), 'tmp_pdf2pic');
  await fs.mkdir(tempDir, { recursive: true });
  const pdf2pic = fromBuffer(buffer, {
    density: 200,
    saveFilename: 'page',
    savePath: tempDir,
    format: 'png',
    width: 1654,
    height: 2339
  });
  let fullText = '';
  const workerPath = process.env.OCR_TESSERACT_WORKER_PATH;
  const corePath = process.env.OCR_TESSERACT_CORE_PATH;
  const langPath = process.env.OCR_TESSERACT_LANG_PATH;
  const tesseractOptions = {};
  if (workerPath) tesseractOptions.workerPath = workerPath;
  if (corePath) tesseractOptions.corePath = corePath;
  if (langPath) tesseractOptions.langPath = langPath;
  const maxPagesEnv = Number(process.env.OCR_TESSERACT_MAX_PAGES);
  const maxPages = Number.isFinite(maxPagesEnv) && maxPagesEnv > 0 ? Math.min(numPages, maxPagesEnv) : numPages;
  try {
    for (let i = 1; i <= maxPages; i++) {
      try {
        const output = await pdf2pic(i);
        const imagePath = output.path;
        const { data: { text } } = await Tesseract.recognize(imagePath, language, tesseractOptions);
        fullText += '\n' + text;
        await fs.unlink(imagePath);
      } catch (_) {}
    }
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch (_) {}
  return cleanText(fullText);
}


