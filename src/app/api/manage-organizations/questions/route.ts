// src/app/api/manage-organizations/questions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import {
  addQuestion,
  getQuestionById,
} from '../../../../src/lib/manage-organizations/examResultService';
import { Question } from '../../../../src/types/manage-organizations';

/**
 * Feature ID: MO-035
 * Feature Name: Question Management API Endpoints - POST (Add Question)
 * What it does: Handles POST requests for adding a new question.
 * Description: Receives question data from the request body and uses the examResultService to add it to the database.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/questions)
 * Module to be implemented: AI-based question extraction and generation.
 */
export async function POST(request: NextRequest) {
  try {
    const questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'> = await request.json();
    if (!questionData.subjectMaterialId || !questionData.questionText || !questionData.correctAnswer || !questionData.options) {
      return NextResponse.json({ message: 'Missing required question fields' }, { status: 400 });
    }
    const newQuestion = await addQuestion(questionData);
    return NextResponse.json({ question: newQuestion }, { status: 201 });
  } catch (error: any) {
    console.error('API Error (POST /questions):', error);
    return NextResponse.json({ message: error.message || 'Failed to add question' }, { status: 500 });
  }
}

/**
 * Feature ID: MO-035
 * Feature Name: Question Management API Endpoints - GET (Get By ID)
 * What it does: Handles GET requests for retrieving a question by its ID.
 * Description: Fetches a specific question document from the 'questions' collection.
 * Current Module Implemented: Manage-Organizations (src/app/api/manage-organizations/questions)
 * Module to be implemented: Frontend for question preview/edit.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Question ID is required' }, { status: 400 });
    }

    const question = await getQuestionById(id);
    if (question) {
      return NextResponse.json({ question }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('API Error (GET /questions):', error);
    return NextResponse.json({ message: error.message || 'Failed to retrieve question' }, { status: 500 });
  }
}
