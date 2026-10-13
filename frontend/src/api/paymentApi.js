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
