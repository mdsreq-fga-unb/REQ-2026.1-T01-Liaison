import { apiUrl } from '../config/api';

export const createOpportunity = async (token: string, data: FormData) => {
  const response = await fetch(apiUrl('/opportunities/'), {
    method: 'POST',
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
      // FormData should NOT have Content-Type set manually
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || JSON.stringify(errorData) || 'Failed to create opportunity');
  }
  return response.json();
};

export const updateOpportunity = async (token: string, id: string, data: FormData) => {
  const response = await fetch(apiUrl(`/opportunities/${id}/`), {
    method: 'PATCH',
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || JSON.stringify(errorData) || 'Failed to update opportunity');
  }
  return response.json();
};

export const publishOpportunity = async (token: string, id: string) => {
  const response = await fetch(apiUrl(`/opportunities/${id}/publish/`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || JSON.stringify(errorData) || 'Failed to publish opportunity');
  }
  return response.json();
};

export const closeOpportunity = async (token: string, id: string) => {
  const response = await fetch(apiUrl(`/opportunities/${id}/close/`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || JSON.stringify(errorData) || 'Failed to close opportunity');
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || JSON.stringify(errorData) || 'Failed to fetch opportunities');
  }
  return response.json();
};
