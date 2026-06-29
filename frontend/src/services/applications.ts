import { apiUrl } from '../config/api';

export async function createApplication(token: string, opportunityId: string) {
  const response = await fetch(apiUrl('/applications/'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ opportunity: opportunityId }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Falha ao enviar candidatura');
  }
  return response.json();
}

export async function getMyApplications(token: string) {
  const response = await fetch(apiUrl('/applications/'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response.json();
}
