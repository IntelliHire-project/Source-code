const {
  createVacancy,
  findVacancyByIdOrCode,
  findAllVacancies,
  updateVacancy,
  closeVacancy,
} = require('../models/vacancyModel');
const { findRecruiterByUserId } = require('../models/recruiterModel');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Creates a new vacancy.
 */
const createVacancyHandler = async (req, res) => {
  try {
    const { jobTitle, title } = req.body;
    if (!jobTitle && !title) {
      return errorResponse(res, 'Job title is required.', 400);
    }

    const userId = req.user ? req.user.id : null;
    let recruiterId = null;

    if (userId) {
      const recruiter = await findRecruiterByUserId(userId);
      if (recruiter) {
        recruiterId = recruiter.id;
      }
    }

    const vacancy = await createVacancy(req.body, userId, recruiterId);
    return successResponse(res, 'Vacancy created successfully.', { vacancy }, 201);
  } catch (error) {
    console.error('Error creating vacancy:', error);
    return errorResponse(res, 'Failed to create vacancy.', 500);
  }
};

/**
 * Gets a vacancy by its ID or vacancy code (e.g. VAC-001).
 */
const getVacancyHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 'Vacancy ID is required.', 400);
    }

    const vacancy = await findVacancyByIdOrCode(id);
    if (!vacancy) {
      return errorResponse(res, 'Vacancy not found.', 404);
    }

    return successResponse(res, 'Vacancy retrieved successfully.', { vacancy });
  } catch (error) {
    console.error('Error fetching vacancy:', error);
    return errorResponse(res, 'Failed to retrieve vacancy.', 500);
  }
};

/**
 * Gets a list of vacancies with filtering, searching, and sorting.
 */
const getVacanciesHandler = async (req, res) => {
  try {
    const {
      status,
      department,
      search,
      sortBy = 'dateDesc',
      page = 1,
      limit = 20,
      myVacancies = 'false',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let recruiterId = null;
    let userId = null;

    if (myVacancies === 'true' && req.user) {
      userId = req.user.id;
      const recruiter = await findRecruiterByUserId(userId);
      if (recruiter) {
        recruiterId = recruiter.id;
      }
    }

    const result = await findAllVacancies({
      recruiterId,
      userId,
      status,
      department,
      search,
      sortBy,
      limit: limitNum,
      offset,
    });

    return successResponse(res, 'Vacancies retrieved successfully.', {
      vacancies: result.vacancies,
      total: result.total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(result.total / limitNum) || 1,
    });
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    return errorResponse(res, 'Failed to retrieve vacancies.', 500);
  }
};

/**
 * Updates an existing vacancy.
 */
const updateVacancyHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await findVacancyByIdOrCode(id);
    if (!existing) {
      return errorResponse(res, 'Vacancy not found.', 404);
    }

    const updated = await updateVacancy(id, req.body);
    return successResponse(res, 'Vacancy updated successfully.', { vacancy: updated });
  } catch (error) {
    console.error('Error updating vacancy:', error);
    return errorResponse(res, 'Failed to update vacancy.', 500);
  }
};

/**
 * Closes an existing vacancy.
 */
const closeVacancyHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const closed = await closeVacancy(id);
    if (!closed) {
      return errorResponse(res, 'Vacancy not found.', 404);
    }

    return successResponse(res, 'Vacancy closed successfully.', { vacancy: closed });
  } catch (error) {
    console.error('Error closing vacancy:', error);
    return errorResponse(res, 'Failed to close vacancy.', 500);
  }
};

module.exports = {
  createVacancyHandler,
  getVacancyHandler,
  getVacanciesHandler,
  updateVacancyHandler,
  closeVacancyHandler,
};
