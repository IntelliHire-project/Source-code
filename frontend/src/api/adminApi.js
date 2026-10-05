import apiInstance from './apiInstance';

export const getRecruiters = async () => {
  const response = await apiInstance.get('/admin/recruiters');
  return response.data;
};

export const updateRecruiterApproval = async (id, status) => {
  const response = await apiInstance.put(`/admin/recruiters/${id}/approval`, { status });
  return response.data;
};
