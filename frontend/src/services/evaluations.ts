import { apiUrl } from '../config/api';

export interface ApplicationStudent {
  id: string;
  nome: string;
  curso: string;
  universidade: string;
  avatar_url: string | null;
}

export type AttendanceStatus = 'present' | 'partial' | 'absent';

export interface Application {
  id: string;
  student: ApplicationStudent;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  created_at: string;
  attendance?: AttendanceStatus | null;
  hours_completed?: number | null;
  completed_at?: string | null;
}

export async function getOpportunityApplications(
  token: string,
  opportunityId: string,
  status?: Application['status']
): Promise<Application[]> {
  const query = status ? `?status=${status}` : '';
  const resp = await fetch(
    apiUrl(`/applications/opportunities/${opportunityId}/${query}`),
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!resp.ok) throw new Error('Erro ao carregar candidatos.');
  return resp.json();
}

// RF14 — registrar frequência: approved → completed com frequência + horas cumpridas.
export async function completeApplication(
  token: string,
  applicationId: string,
  attendance: AttendanceStatus,
  hoursCompleted: number
): Promise<Application> {
  const resp = await fetch(
    apiUrl(`/applications/${applicationId}/complete/`),
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attendance, hours_completed: hoursCompleted }),
    }
  );
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error((data as any).detail ?? 'Erro ao registrar frequência.');
  return data;
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
