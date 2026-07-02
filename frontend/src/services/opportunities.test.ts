/**
 * Testes TDD (Red Phase) — opportunities service
 *
 * Cobre:
 * - getOpportunities(token, params) → faz GET /opportunities/ com query params
 * - getDashboard(token) → faz GET /students/dashboard/
 * - saveOpportunity(token, id) → faz POST /opportunities/{id}/save/
 * - unsaveOpportunity(token, id) → faz DELETE /opportunities/{id}/save/
 * - getCategories(token) → faz GET /opportunities/categories/
 * - Autorização via Bearer token é enviada em todas as chamadas
 * - Erros HTTP são propagados como exceções
 */

import {
  getOpportunities,
  getDashboard,
  saveOpportunity,
  unsaveOpportunity,
  getCategories,
} from './opportunities';

// Mock global fetch
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

const MOCK_TOKEN = 'eyJtest-token';

const MOCK_OPPORTUNITIES_RESPONSE = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 'uuid-opp-1',
      title: 'Tutoria de Matemática',
      area: 'educacao',
      status: 'active',
      featured: false,
      is_saved: false,
      applicants_count: 0,
    },
    {
      id: 'uuid-opp-2',
      title: 'Atendimento em Saúde',
      area: 'saude',
      status: 'active',
      featured: true,
      is_saved: true,
      applicants_count: 0,
    },
  ],
};

const MOCK_DASHBOARD_RESPONSE = {
  nome: 'João Silva',
  horas_acumuladas: 0,
  horas_exigidas: 120,
  progresso_percentual: 0,
  inscricoes_ativas: 0,
  vagas_salvas: 2,
  saudacao: 'Bom dia',
};

const MOCK_CATEGORIES_RESPONSE = [
  { area: 'all', label: 'Todas', count: 5 },
  { area: 'educacao', label: 'Educação', count: 2 },
  { area: 'saude', label: 'Saúde', count: 3 },
];

describe('getOpportunities', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('fetches opportunities with no params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_OPPORTUNITIES_RESPONSE,
    });

    const result = await getOpportunities(MOCK_TOKEN, {});
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/opportunities\//);
  });

  it('sends Authorization Bearer header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_OPPORTUNITIES_RESPONSE,
    });

    await getOpportunities(MOCK_TOKEN, {});
    const [, options] = mockFetch.mock.calls[0];
    expect(options?.headers?.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
  });

  it('includes search param in URL when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_OPPORTUNITIES_RESPONSE,
    });

    await getOpportunities(MOCK_TOKEN, { search: 'matemática' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toMatch(/search=matem%C3%A1tica|search=matem.tica/);
  });

  it('includes area param in URL when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_OPPORTUNITIES_RESPONSE,
    });

    await getOpportunities(MOCK_TOKEN, { area: 'educacao' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toMatch(/area=educacao/);
  });

  it('includes featured param in URL when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_OPPORTUNITIES_RESPONSE,
    });

    await getOpportunities(MOCK_TOKEN, { featured: true });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toMatch(/featured=true/);
  });

  it('includes modality param in URL when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_OPPORTUNITIES_RESPONSE,
    });

    await getOpportunities(MOCK_TOKEN, { modality: 'remoto' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toMatch(/modality=remoto/);
  });

  it('returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_OPPORTUNITIES_RESPONSE,
    });

    const result = await getOpportunities(MOCK_TOKEN, {});
    expect(result).toEqual(MOCK_OPPORTUNITIES_RESPONSE);
  });

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Unauthorized' }),
    });

    await expect(getOpportunities(MOCK_TOKEN, {})).rejects.toThrow();
  });
});

describe('getDashboard', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('fetches dashboard data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_DASHBOARD_RESPONSE,
    });

    const result = await getDashboard(MOCK_TOKEN);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/students\/dashboard\//);
  });

  it('sends Authorization Bearer header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_DASHBOARD_RESPONSE,
    });

    await getDashboard(MOCK_TOKEN);
    const [, options] = mockFetch.mock.calls[0];
    expect(options?.headers?.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
  });

  it('returns all dashboard fields', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_DASHBOARD_RESPONSE,
    });

    const result = await getDashboard(MOCK_TOKEN);
    expect(result).toHaveProperty('nome');
    expect(result).toHaveProperty('horas_acumuladas');
    expect(result).toHaveProperty('horas_exigidas');
    expect(result).toHaveProperty('progresso_percentual');
    expect(result).toHaveProperty('inscricoes_ativas');
    expect(result).toHaveProperty('vagas_salvas');
    expect(result).toHaveProperty('saudacao');
  });

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ detail: 'Forbidden' }),
    });

    await expect(getDashboard(MOCK_TOKEN)).rejects.toThrow();
  });
});

describe('saveOpportunity', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('makes POST request to save endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({}),
    });

    await saveOpportunity(MOCK_TOKEN, 'uuid-opp-1');
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/opportunities\/uuid-opp-1\/save\//);
    expect(options?.method).toBe('POST');
  });

  it('sends Authorization Bearer header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({}),
    });

    await saveOpportunity(MOCK_TOKEN, 'uuid-opp-1');
    const [, options] = mockFetch.mock.calls[0];
    expect(options?.headers?.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
  });

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ detail: 'Forbidden' }),
    });

    await expect(saveOpportunity(MOCK_TOKEN, 'uuid-opp-1')).rejects.toThrow();
  });
});

describe('unsaveOpportunity', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('makes DELETE request to save endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    });

    await unsaveOpportunity(MOCK_TOKEN, 'uuid-opp-1');
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/opportunities\/uuid-opp-1\/save\//);
    expect(options?.method).toBe('DELETE');
  });

  it('sends Authorization Bearer header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    });

    await unsaveOpportunity(MOCK_TOKEN, 'uuid-opp-1');
    const [, options] = mockFetch.mock.calls[0];
    expect(options?.headers?.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
  });

  it('throws on 404', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Not found' }),
    });

    await expect(unsaveOpportunity(MOCK_TOKEN, 'uuid-opp-1')).rejects.toThrow();
  });
});

describe('getCategories', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('fetches categories from correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_CATEGORIES_RESPONSE,
    });

    await getCategories(MOCK_TOKEN);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toMatch(/\/opportunities\/categories\//);
  });

  it('sends Authorization Bearer header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_CATEGORIES_RESPONSE,
    });

    await getCategories(MOCK_TOKEN);
    const [, options] = mockFetch.mock.calls[0];
    expect(options?.headers?.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
  });

  it('returns array of categories', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_CATEGORIES_RESPONSE,
    });

    const result = await getCategories(MOCK_TOKEN);
    expect(Array.isArray(result)).toBe(true);
  });

  it('returns categories with area, label, count fields', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_CATEGORIES_RESPONSE,
    });

    const result = await getCategories(MOCK_TOKEN);
    result.forEach((cat: any) => {
      expect(cat).toHaveProperty('area');
      expect(cat).toHaveProperty('label');
      expect(cat).toHaveProperty('count');
    });
  });

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Unauthorized' }),
    });

    await expect(getCategories(MOCK_TOKEN)).rejects.toThrow();
  });
});
