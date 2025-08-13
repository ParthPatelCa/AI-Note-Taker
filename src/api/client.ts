import { handleError, showLoadingIndicator } from "../utils/errorHandler";

const isProd = process.env.NODE_ENV === "production";
const cfg = require("../../app.json").expo.extra.apiBase;
const BASE_URL = isProd ? cfg.production : cfg.development;

export async function transcribeAsync(uri: string) {
  showLoadingIndicator(true);
  try {
    const blob = await (await fetch(uri)).blob();
    const form = new FormData();
    form.append("file", blob as any, "audio.m4a");
    const r = await fetch(`${BASE_URL}/transcribe`, { method: "POST", body: form });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  } catch (error) {
    handleError(error, "Failed to transcribe audio.");
    throw error; // Re-throw to propagate the error
  } finally {
    showLoadingIndicator(false);
  }
}

export async function ocrAsync(uri: string) {
  showLoadingIndicator(true);
  try {
    const blob = await (await fetch(uri)).blob();
    const form = new FormData();
    form.append("file", blob as any, "image.jpg");
    const r = await fetch(`${BASE_URL}/ocr`, { method: "POST", body: form });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  } catch (error) {
    handleError(error, "Failed to perform OCR.");
    throw error; // Re-throw to propagate the error
  } finally {
    showLoadingIndicator(false);
  }
}

export async function summarizeAsync(text: string, level: "short"|"medium"|"full"="medium", want_actions=true) {
  showLoadingIndicator(true);
  try {
    const r = await fetch(`${BASE_URL}/summarize`, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ text, level, want_actions })
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  } catch (error) {
    handleError(error, "Failed to summarize text.");
    throw error; // Re-throw to propagate the error
  } finally {
    showLoadingIndicator(false);
  }
}
