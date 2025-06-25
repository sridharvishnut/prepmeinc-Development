import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';
import PQueue from 'p-queue';
import { encoding_for_model } from '@dqbd/tiktoken';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';

const queue = new PQueue({
  concurrency: 2,
  intervalCap: 5,
  interval: 60_000,
});

const MAX_INPUT_TOKENS = 8000;

function countTokens(text: string): number {
  const encoder = encoding_for_model('gpt-3.5-turbo'); // Gemini tokenizer not available, close approx.
  const tokens = encoder.encode(text);
  encoder.free();
  return tokens.length;
}

function splitTextToChunks(text: string, maxTokens: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current: string[] = [];

  for (const word of words) {
    current.push(word);
    const tokenCount = countTokens(current.join(' '));
    if (tokenCount >= maxTokens) {
      chunks.push(current.join(' '));
      current = [];
    }
  }

  if (current.length > 0) {
    chunks.push(current.join(' '));
  }

  return chunks;
}

async function callGemini(payload: any, attempt = 1): Promise<any> {
  const backoff = Math.pow(2, attempt) * 1000;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.status === 429) {
      console.warn(`⚠️ 429 Too Many Requests. Retrying in ${backoff / 1000}s (Attempt ${attempt})`);
      await new Promise((res) => setTimeout(res, backoff));
      return callGemini(payload, attempt + 1);
    }

    if (!res.ok) {
      throw new Error(`❌ Gemini API error ${res.status}: ${await res.text()}`);
    }

    return await res.json();
  } catch (err) {
    console.error('🔥 Gemini request failed:', err);
    throw err;
  }
}

// ========== PUBLIC FUNCTIONS ========== //

export async function summarizeTextSmart(input: string): Promise<string[]> {
  const chunks = splitTextToChunks(input, MAX_INPUT_TOKENS);
  const results: string[] = [];

  for (const chunk of chunks) {
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `Summarize the following text:

${chunk}` }],
        },
      ],
    };

    const response = await queue.add(() => callGemini(payload));
    const summary = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    results.push(summary || '[No response]');
  }

  return results;
}

export async function generateMCQsSmart(input: string): Promise<string[]> {
  const chunks = splitTextToChunks(input, MAX_INPUT_TOKENS);
  const results: string[] = [];

  for (const chunk of chunks) {
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text:
                `Generate 5 multiple-choice questions (MCQs) with 4 options and answers from the following passage:

${chunk}`,
            },
          ],
        },
      ],
    };

    const response = await queue.add(() => callGemini(payload));
    const mcqs = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    results.push(mcqs || '[No MCQs returned]');
  }

  return results;
}

export async function askDocumentSmart(documentText: string, question: string): Promise<string[]> {
  const chunks = splitTextToChunks(documentText, MAX_INPUT_TOKENS);
  const results: string[] = [];

  for (const chunk of chunks) {
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text:
                `Given the following document, answer the question:

Document: ${chunk}

Question: ${question}`,
            },
          ],
        },
      ],
    };

    const response = await queue.add(() => callGemini(payload));
    const answer = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    results.push(answer || '[No answer found]');
  }

  return results;
}
