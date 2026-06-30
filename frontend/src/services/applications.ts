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

/**
 * Lista as candidaturas do estudante autenticado.
 * Aceita filtro opcional por status (pending/approved/rejected/cancelled).
 *
 * O backend usa PageNumberPagination — a resposta vem como
 * { count, next, previous, results }. Esta função já desembrulha
 * `results`, então quem consome continua recebendo um array puro.
 */
export async function getMyApplications(token: string, status?: string) {
  const url = status
    ? apiUrl(`/applications/?status=${encodeURIComponent(status)}`)
    : apiUrl('/applications/');
 
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  const data = await response.json();
 
  // Compatível com resposta paginada ({results: [...]}) e com array puro
  // (caso a paginação seja removida/alterada no futuro).
  if (data && Array.isArray(data.results)) {
    return data.results;
  }
  return Array.isArray(data) ? data : [];
}
 