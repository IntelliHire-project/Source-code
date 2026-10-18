import apiInstance from './apiInstance';

export const submitBankTransfer = async ({ vacancy, paymentReference, paymentSlip }) => {
  const formData = new FormData();
  formData.append('vacancy', JSON.stringify(vacancy));
  formData.append('paymentReference', paymentReference);
  formData.append('paymentSlip', paymentSlip);

  const response = await apiInstance.post('/payments/bank-transfer', formData);
  return response.data;
};

export const getBankTransferStatus = async (paymentReference) => {
  const response = await apiInstance.get(
    `/payments/${encodeURIComponent(paymentReference)}`
  );
  return response.data;
};

export const getAdminPayments = async (params = {}) => {
  const response = await apiInstance.get('/admin/payments', { params });
  return response.data;
};

export const getAdminPaymentStats = async () => {
  const response = await apiInstance.get('/admin/payments/stats');
  return response.data;
};

export const reviewPayment = async (id, { action, reason }) => {
  const response = await apiInstance.patch(`/admin/payments/${id}/review`, {
    action,
    reason,
  });
  return response.data;
};

export const fetchPaymentProofBlob = async (id) => {
  const response = await apiInstance.get(`/admin/payments/${id}/proof`, {
    responseType: 'blob',
  });
  return response.data;
};
