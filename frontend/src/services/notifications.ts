import { apiUrl } from '../config/api';

export interface NotificationData {
  id: string;
  type: 'application_approved' | 'application_rejected' | 'new_application';
  title: string;
  message: string;
  related_opportunity: string | null;
  related_application: string | null;
  opportunity_title: string | null;
  application_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  results: NotificationData[];
  unread_count: number;
}

export async function getNotifications(token: string): Promise<NotificationsResponse> {
  const resp = await fetch(apiUrl('/notifications/'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error('Erro ao carregar notificações.');
  return resp.json();
}

export async function markAsRead(token: string, id: string): Promise<NotificationData> {
  const resp = await fetch(apiUrl(`/notifications/${id}/read/`), {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error((data as any).detail ?? 'Erro ao marcar notificação como lida.');
  }
  return resp.json();
}

export async function markAllAsRead(token: string): Promise<{ updated: number }> {
  const resp = await fetch(apiUrl('/notifications/read-all/'), {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error((data as any).detail ?? 'Erro ao marcar todas como lidas.');
  }
  return resp.json();
}
