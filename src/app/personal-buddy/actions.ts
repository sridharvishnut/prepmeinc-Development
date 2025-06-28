'use server';

import { summarizeTextSmart, generateMCQsSmart, askDocumentSmart } from '../../../geminiClient';

async function fetchDocumentText(downloadURL: string): Promise<string> {
  const res = await fetch(downloadURL);
  if (!res.ok) throw new Error('Failed to fetch document text');
  return await res.text();
}

export async function summarizeDocumentServer(downloadURL: string): Promise<string> {
  const documentText = await fetchDocumentText(downloadURL);
  const summaries = await summarizeTextSmart(documentText);
  return summaries.join('\n\n');
}

export async function generateMCQsServer(downloadURL: string): Promise<string> {
  const documentText = await fetchDocumentText(downloadURL);
  const mcqs = await generateMCQsSmart(documentText);
  return mcqs.join('\n\n');
}

export async function askDocumentServer(downloadURL: string, question: string): Promise<string> {
  const documentText = await fetchDocumentText(downloadURL);
  const answers = await askDocumentSmart(documentText, question);
  return answers.join('\n\n');
}
