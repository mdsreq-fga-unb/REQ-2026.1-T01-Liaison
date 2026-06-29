import { apiUrl } from '../config/api';

export const createOpportunity = async (token: string, data: FormData) => {
  const response = await fetch(apiUrl('/opportunities/'), {
    method: 'POST',
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to create opportunity');
  }
  return response.json();
};

export const getMyOpportunities = async (token: string) => {
  // Endpoint dedicado da org → lista pura (sem paginação).
  const response = await fetch(apiUrl('/organizations/me/opportunities/'), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch opportunities');
  }
  return response.json();
};

export interface OpportunityParams {
  search?: string;
  area?: string;
  featured?: boolean;
  modality?: string;
  location?: string;
  workload_max?: string;
  page?: number;
}

export async function getOpportunities(token: string, params: OpportunityParams) {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.set('search', params.search);
  if (params.area) queryParams.set('area', params.area);
  if (params.featured !== undefined) queryParams.set('featured', String(params.featured));
  if (params.modality) queryParams.set('modality', params.modality);
  if (params.location) queryParams.set('location', params.location);
  if (params.workload_max) queryParams.set('workload_max', params.workload_max);
  if (params.page) queryParams.set('page', String(params.page));

  const queryString = queryParams.toString();
  const url = apiUrl('/opportunities/') + (queryString ? `?${queryString}` : '');

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response.json();
}

export async function getOpportunity(id: string, token?: string | null) {
  // RF09: detalhe é público — token é opcional (só personaliza is_saved/already_applied).
  const response = await fetch(apiUrl(`/opportunities/${id}/`), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response.json();
}

export async function getDashboard(token: string) {
  const response = await fetch(apiUrl('/students/dashboard/'), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response.json();
}

export async function saveOpportunity(token: string, id: string) {
  const response = await fetch(apiUrl(`/opportunities/${id}/save/`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response.json();
}

export async function unsaveOpportunity(token: string, id: string) {
  const response = await fetch(apiUrl(`/opportunities/${id}/save/`), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  // 204 No Content — no JSON body
  if (response.status === 204) {
    return null;
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function getCategories(token: string) {
  const response = await fetch(apiUrl('/opportunities/categories/'), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response.json();
}

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
