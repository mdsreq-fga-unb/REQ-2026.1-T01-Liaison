import { apiUrl } from '../config/api';

export const createOpportunity = async (data: FormData) => {
  // Assuming a token might be needed, it should be retrieved from secure storage,
  // but for now we'll just use fetch according to the existing config.
  const response = await fetch(apiUrl('/opportunities/'), {
    method: 'POST',
    body: data,
    // headers like Authorization would go here
  });
  if (!response.ok) {
    throw new Error('Failed to create opportunity');
  }
  return response.json();
};

export const getMyOpportunities = async () => {
  const response = await fetch(apiUrl('/opportunities/'));
  if (!response.ok) {
    throw new Error('Failed to fetch opportunities');
  }
  return response.json();
};
