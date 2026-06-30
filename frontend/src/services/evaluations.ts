import { apiUrl } from '../config/api';

export interface ApplicationStudent {
  nome: string;
  curso: string;
  universidade: string;
}

export interface Application {
  id: string;
  student: ApplicationStudent;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
}

export async function getOpportunityApplications(
  token: string,
  opportunityId: string
): Promise<Application[]> {
  const resp = await fetch(
    apiUrl(`/applications/opportunities/${opportunityId}/`),
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!resp.ok) throw new Error('Erro ao carregar candidatos.');
  return resp.json();
}

export async function evaluateApplication(
  token: string,
  applicationId: string,
  newStatus: 'approved' | 'rejected',
  confirmed = false
): Promise<{ status: string; requires_confirmation?: boolean; detail?: string; _httpStatus?: number }> {
  const resp = await fetch(
    apiUrl(`/applications/${applicationId}/evaluate/`),
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus, confirmed }),
    }
  );
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok && resp.status !== 409) throw new Error((data as any).detail ?? 'Erro ao avaliar candidatura.');
  return { ...data, _httpStatus: resp.status };
}
