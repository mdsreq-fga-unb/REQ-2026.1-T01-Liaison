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
    throw new Error(errorData.detail || 'Failed to update opportunity');
  }
  return response.json();
};

export const publishOpportunity = async (token: string, id: string) => {
  const response = await fetch(apiUrl(`/opportunities/${id}/publish/`), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to publish opportunity');
  }
  return response.json();
};

export const closeOpportunity = async (token: string, id: string) => {
  const response = await fetch(apiUrl(`/opportunities/${id}/close/`), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to close opportunity');
  }
  return response.json();
};

export const reopenOpportunity = async (token: string, id: string) => {
  const response = await fetch(apiUrl(`/opportunities/${id}/reopen/`), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to reopen opportunity');
  }
  return response.json();
};

export const deleteOpportunity = async (token: string, id: string) => {
  const response = await fetch(apiUrl(`/opportunities/${id}/`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to delete opportunity');
  }
  return response.status === 204 ? null : response.json().catch(() => null);
};
