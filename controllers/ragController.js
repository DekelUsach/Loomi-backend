import multer from 'multer';
import supabase from '../config/supabaseClient.js';
import { indexStory, askQuestion, allocateNextStoryId, releaseMemoryForStory } from '../rag/index.js';
import { extractTextFromPdf, extractTextFromDocx, ocrSpaceExtract } from '../rag/ingest.js';
import { splitTextWithGemini, splitIntoParagraphArray } from '../rag/gemini-splitter.js';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadMiddleware = upload.single('file');

function deriveTitleFromText(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return 'Texto sin título';
  const firstSentence = trimmed.split(/[\.!?]/)[0] || trimmed.slice(0, 120);
  return firstSentence.slice(0, 120);
}

async function getNextId(tableName) {
  const { data, error } = await supabase
    .from(tableName)
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error && String(error.message || '').toLowerCase().includes('permission')) {
    throw new Error(`supabase_permission_denied_${tableName}`);
  }
  const maxId = Number.parseInt(data?.id, 10);
  return Number.isFinite(maxId) ? maxId + 1 : 1;
}

async function insertPreLoadedTextWithOptionalFullText({ title, fullText }) {
  const safeTitle = String(title || '').trim() || String(fullText || '').slice(0, 120) || 'Texto sin título';
  const newId = await getNextId('preLoadedTexts');
  let d, e;
  try {
    ({ data: d, error: e } = await supabase
      .from('preLoadedTexts')
      .insert({ id: newId, title: safeTitle, content: String(fullText || '') })
      .select('id')
      .single());
  } catch (err) {
    e = err;
  }
  if (e) {
    const msg = String(e.message || '').toLowerCase();
    const schemaMismatch = msg.includes('column') && msg.includes('content') && (msg.includes('does not exist') || msg.includes('no existe') || msg.includes('could not find'));
    if (!schemaMismatch) throw new Error(`supabase_insert_preLoadedTexts_failed: ${e.message}`);
    const fb = await supabase
      .from('preLoadedTexts')
      .insert({ id: newId, title: safeTitle })
      .select('id')
      .single();
    if (fb.error) throw new Error(`supabase_insert_preLoadedTexts_fallback_failed: ${fb.error.message}`);
    return fb.data.id;
  }
  return d.id;
}

async function insertPreLoadedParagraphs({ idText, paragraphs }) {
  const list = Array.isArray(paragraphs) ? paragraphs : [];
  if (list.length === 0) return 0;
  let nextId = await getNextId('preLoadedParagraphs');
  const rows = list.map((content, idx) => ({
    id: nextId + idx,
    content: String(content || ''),
    imageURL: null,
    order: idx + 1,
    idText: Number(idText)
  }));
  const { error } = await supabase.from('preLoadedParagraphs').insert(rows);
  if (error) throw new Error(`supabase_insert_preLoadedParagraphs_failed: ${error.message}`);
  return rows.length;
}

export async function uploadAndIndex(req, res) {
  try {
    const authUser = req.user; // from authenticate middleware
    if (!authUser?.id) return res.status(401).json({ error: 'No autenticado' });

    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Archivo requerido en el campo "file"' });
    const originalName = String(file.originalname || '').toLowerCase();
    console.log(`[RAG] Upload iniciado: name=${originalName}, size=${file.size} bytes`);

    let fullText = '';
    if (originalName.endsWith('.pdf')) {
      console.log('[RAG] Extrayendo texto de PDF...');
      fullText = await extractTextFromPdf(file.buffer, { language: 'spa', minLength: 200 });
      if (!fullText || fullText.length < 100) {
        // Fallback a OCR remoto si el texto directo/ocr local es insuficiente
        console.log('[RAG] Texto insuficiente. Intentando OCR remoto...');
        fullText = await ocrSpaceExtract(file.buffer, 'application/pdf', 'spa');
      }
    } else if (originalName.endsWith('.docx')) {
      console.log('[RAG] Extrayendo texto de DOCX...');
      fullText = await extractTextFromDocx(file.buffer);
    } else {
      return res.status(400).json({ error: 'Formato no soportado. Use .pdf o .docx' });
    }

    fullText = String(fullText || '').trim();
    console.log(`[RAG] Texto extraído. length=${fullText.length}`);
    if (!fullText || fullText.length < 30) {
      return res.status(422).json({ error: 'No se pudo extraer texto suficiente del archivo.' });
    }

    // Dividir en párrafos visuales con Gemini
    let splitMarked = '';
    try {
      console.log('[RAG] Solicitando división de párrafos a Gemini...');
      splitMarked = await splitTextWithGemini(fullText);
    } catch (_) {
      splitMarked = '';
    }
    const paragraphs = splitIntoParagraphArray(splitMarked);
    const effectiveParagraphs = paragraphs.length > 0 ? paragraphs : [fullText];
    console.log(`[RAG] División completa. paragraphs=${effectiveParagraphs.length}`);

    const clientTitle = (req.body?.title || '').toString().trim();
    const title = clientTitle || deriveTitleFromText(fullText);
    console.log(`[RAG] Título a guardar: "${title}"`);

    // Guardar en Supabase (preLoadedTexts y preLoadedParagraphs)
    const idText = await insertPreLoadedTextWithOptionalFullText({ title, fullText });
    console.log(`[RAG] Insert preLoadedTexts OK. id=${idText}`);
    await insertPreLoadedParagraphs({ idText, paragraphs: effectiveParagraphs });
    console.log(`[RAG] Insert preLoadedParagraphs OK. count=${effectiveParagraphs.length}`);

    // Indexar en LanceDB usando el id del texto como storyId
    let indexed = false;
    try {
      console.log('[RAG] Indexando en LanceDB...');
      await indexStory(String(idText), fullText, title);
      indexed = true;
      console.log('[RAG] Index LanceDB: OK');
      // Liberar memoria local para cumplir el requisito de no mantener en RAM
      try { await releaseMemoryForStory(String(idText)); } catch (_) {}
    } catch (e) {
      console.warn('[RAG] LanceDB indexing failed, continuing without vector index:', e?.message || e);
    }

    return res.status(201).json({
      message: 'Texto cargado e indexado',
      textId: idText,
      title,
      paragraphsCount: effectiveParagraphs.length,
      indexed,
    });
  } catch (err) {
    console.error('[RAG] uploadAndIndex error:', err);
    return res.status(500).json({ error: err.message || 'Error inesperado' });
  }
}

export async function ask(req, res) {
  try {
    const authUser = req.user;
    if (!authUser?.id) return res.status(401).json({ error: 'No autenticado' });

    const { textId, question } = req.body || {};
    if (!textId || !question) return res.status(400).json({ error: 'Faltan parámetros: textId y question' });
    console.log(`[RAG] Ask: textId=${textId} question="${String(question).slice(0,120)}..."`);

    const answer = await askQuestion(String(textId), String(question));
    console.log('[RAG] Ask → respuesta lista (longitud):', (answer || '').length);
    return res.status(200).json({ answer });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error inesperado' });
  }
}


