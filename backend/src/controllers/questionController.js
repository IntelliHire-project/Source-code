const {
  createQuestion,
  findQuestionByIdOrCode,
  findAllQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionStats,
} = require('../models/questionModel');
const { findRecruiterByUserId } = require('../models/recruiterModel');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Creates a new question in the Question Bank.
 */
const createQuestionHandler = async (req, res) => {
  try {
    const { title, questionText, questionType, type } = req.body;

    const mainText = title || questionText;
    if (!mainText || !mainText.trim()) {
      return errorResponse(res, 'Question text or title is required.', 400);
    }

    const resolvedType = type || questionType || 'Multiple Choice';

    // Basic type-specific validation
    if (resolvedType === 'Multiple Choice' || resolvedType === 'MCQ') {
      const options = req.body.options || [];
      const filledOptions = Array.isArray(options) ? options.filter(o => o && String(o).trim()) : [];
      if (filledOptions.length < 2) {
        return errorResponse(res, 'Multiple choice questions require at least 2 answer options.', 400);
      }
    }

    // Determine author user / recruiter
    const userId = req.user ? req.user.id : null;
    let recruiterId = null;

    if (userId) {
      const recruiter = await findRecruiterByUserId(userId);
      if (recruiter) {
        recruiterId = recruiter.id;
      }
    }

    const question = await createQuestion(req.body, userId, recruiterId);
    return successResponse(res, 'Question created successfully.', { question }, 201);
  } catch (error) {
    console.error('Error creating question:', error);
    return errorResponse(res, 'Failed to create question: ' + error.message, 500);
  }
};

/**
 * Lists questions with optional filtering, search, and pagination.
 */
const getQuestionsHandler = async (req, res) => {
  try {
    const {
      search,
      query,
      q,
      category,
      section,
      type,
      questionType,
      difficulty,
      status,
      jobRole,
      role,
      sortBy = 'dateDesc',
      page = 1,
      limit = 50,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const filters = {
      search: search || query || q || '',
      category: category || null,
      section: section || null,
      type: type || questionType || null,
      difficulty: difficulty || null,
      status: status || null,
      jobRole: jobRole || role || null,
      sortBy,
      limit: limitNum,
      offset,
    };

    const result = await findAllQuestions(filters);

    return successResponse(res, 'Questions retrieved successfully.', {
      questions: result.questions,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return errorResponse(res, 'Failed to retrieve questions: ' + error.message, 500);
  }
};

/**
 * Retrieves a single question by its numeric ID or code (e.g. Q-1001).
 */
const getQuestionHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 'Question ID or code is required.', 400);
    }

    const question = await findQuestionByIdOrCode(id);
    if (!question) {
      return errorResponse(res, 'Question not found.', 404);
    }

    return successResponse(res, 'Question retrieved successfully.', { question });
  } catch (error) {
    console.error('Error fetching question:', error);
    return errorResponse(res, 'Failed to retrieve question: ' + error.message, 500);
  }
};

/**
 * Updates an existing question by its ID or code.
 */
const updateQuestionHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 'Question ID or code is required.', 400);
    }

    const updated = await updateQuestion(id, req.body);
    if (!updated) {
      return errorResponse(res, 'Question not found or update failed.', 404);
    }

    return successResponse(res, 'Question updated successfully.', { question: updated });
  } catch (error) {
    console.error('Error updating question:', error);
    return errorResponse(res, 'Failed to update question: ' + error.message, 500);
  }
};

/**
 * Deletes a question from the database.
 */
const deleteQuestionHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 'Question ID or code is required.', 400);
    }

    const deleted = await deleteQuestion(id);
    if (!deleted) {
      return errorResponse(res, 'Question not found or already deleted.', 404);
    }

    return successResponse(res, 'Question deleted successfully.');
  } catch (error) {
    console.error('Error deleting question:', error);
    return errorResponse(res, 'Failed to delete question: ' + error.message, 500);
  }
};

/**
 * Retrieves aggregate statistics (e.g., total questions, breakdown by difficulty & type).
 */
const getQuestionStatsHandler = async (req, res) => {
  try {
    const stats = await getQuestionStats();
    return successResponse(res, 'Question statistics retrieved successfully.', { stats });
  } catch (error) {
    console.error('Error fetching question stats:', error);
    return errorResponse(res, 'Failed to retrieve question statistics.', 500);
  }
};

module.exports = {
  createQuestionHandler,
  getQuestionsHandler,
  getQuestionHandler,
  updateQuestionHandler,
  deleteQuestionHandler,
  getQuestionStatsHandler,
};

