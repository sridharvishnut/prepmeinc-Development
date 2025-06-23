import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ensure you set this in your .env.local

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

export async function POST(req: Request) {
  try {
    const { action, documentText, question } = await req.json();

    if (!documentText) {
      return NextResponse.json({ error: "Document text is required." }, { status: 400 });
    }

    let prompt = "";
    let resultText = "";

    switch (action) {
      case 'summarize':
        prompt = `Summarize the following document concisely:

${documentText}`;
        try {
          const summaryResult = await model.generateContent(prompt);
          resultText = summaryResult.response.text();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("Error generating summary:", error);
          return NextResponse.json({
            error: "Failed to generate summary.",
            details: errorMessage,
            stack: error instanceof Error ? error.stack : "No stack trace"
          }, { status: 500 });
        }
        break;
      case 'generate_mcqs':
        prompt = `Generate 5 multiple-choice questions (MCQs) with 4 options each and the correct answer based on the following document. Format as: 

Question:
Option A:
Option B:
Option C:
Option D:
Correct Answer:

${documentText}`;
        try {
          const mcqResult = await model.generateContent(prompt);
          resultText = mcqResult.response.text();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("Error generating MCQs:", error);
          return NextResponse.json({
            error: "Failed to generate MCQs.",
            details: errorMessage,
            stack: error instanceof Error ? error.stack : "No stack trace"
          }, { status: 500 });
        }
        break;
      case 'ask_document':
        if (!question) {
          return NextResponse.json({ error: "Question is required for 'ask_document' action." }, { status: 400 });
        }
        prompt = `Based on the following document, answer the question: "${question}"

Document:
${documentText}

Answer:`;
        try {
          const qnaResult = await model.generateContent(prompt);
          resultText = qnaResult.response.text();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("Error answering document question:", error);
          return NextResponse.json({
            error: "Failed to answer document question.",
            details: errorMessage,
            stack: error instanceof Error ? error.stack : "No stack trace"
          }, { status: 500 });
        }
        break;
      default:
        return NextResponse.json({ error: "Invalid AI action." }, { status: 400 });
    }

    return NextResponse.json({ result: resultText });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("API Error (outer catch block):", error);
    return NextResponse.json({
      error: "Failed to process AI request.",
      details: errorMessage,
      stack: error instanceof Error ? error.stack : "No stack trace"
    }, { status: 500 });
  }
}
