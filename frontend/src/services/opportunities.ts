import { apiUrl } from '../config/api';

export const createOpportunity = async (token: string, data: FormData) => {
  const response = await fetch(apiUrl('/opportunities/'), {
    method: 'POST',
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
      // FormData should NOT have Content-Type set manually (let browser/fetch set boundary)
    },
  });
  if (!response.ok) {
    throw new Error('Failed to create opportunity');
  }
  return response.json();
};

export const getMyOpportunities = async (token: string) => {
  const response = await fetch(apiUrl('/opportunities/'), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch opportunities');
  }
  return response.json();
};
