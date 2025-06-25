'use server';

import { summarizeTextSmart, generateMCQsSmart, askDocumentSmart } from '../../../geminiClient';

export async function summarizeDocumentServer(documentText: string): Promise<string> {
  const summaries = await summarizeTextSmart(documentText);
  return summaries.join(`

`);
}

export async function generateMCQsServer(documentText: string): Promise<string> {
  const mcqs = await generateMCQsSmart(documentText);
  return mcqs.join(`

`);
}

export async function askDocumentServer(documentText: string, question: string): Promise<string> {
  const answers = await askDocumentSmart(documentText, question);
  return answers.join(`

`);
}
