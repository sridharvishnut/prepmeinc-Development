export const callGeminiApi = async (action: string, documentText: string, question?: string) => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, documentText, question }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server-side error details:", errorData.details);
      console.error("Server-side error stack:", errorData.stack);
      throw new Error(errorData.error || 'Something went wrong with the AI request.');
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

export const summarizeDocument = async (documentText: string): Promise<string> => {
  return callGeminiApi('summarize', documentText);
};

export const generateMCQs = async (documentText: string): Promise<string> => {
  return callGeminiApi('generate_mcqs', documentText);
};

export const askDocument = async (documentText: string, question: string): Promise<string> => {
  return callGeminiApi('ask_document', documentText, question);
};