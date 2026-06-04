import { studentRegister, organizationRegister } from './api';

// Mock global fetch
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

const VALID_PAYLOAD = {
  email: 'ana.souza@unb.br',
  password: 'Senha123',
  nome: 'Ana Souza',
  telefone: '(61) 9 1234-5678',
  universidade: 'Universidade de Brasília',
  curso: 'Engenharia de Software',
  matricula: '20231234567',
  semestre_atual: 5,
  turno: 'matutino' as const,
  ano_conclusao: 2027,
  horas_extensao_exigidas: 360,
  interesses: ['saude', 'educacao', 'tecnologia'],
};

const SUCCESS_RESPONSE = {
  id: 'uuid-123',
  email: 'ana.souza@unb.br',
  nome: 'Ana Souza',
  role: 'estudante',
  student_profile: {
    universidade: 'Universidade de Brasília',
    curso: 'Engenharia de Software',
    matricula: '20231234567',
    semestre_atual: 5,
    turno: 'matutino',
    ano_conclusao: 2027,
    horas_extensao_exigidas: 360,
    interesses: ['saude', 'educacao', 'tecnologia'],
  },
  tokens: {
    access: 'eyJaccess...',
    refresh: 'eyJrefresh...',
  },
};

describe('api.studentRegister', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('calls the correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => SUCCESS_RESPONSE,
    });

    await studentRegister(VALID_PAYLOAD);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/v1/auth/register/student/');
  });

  it('uses POST method', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => SUCCESS_RESPONSE,
    });

    await studentRegister(VALID_PAYLOAD);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('POST');
  });

  it('sends JSON content-type header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => SUCCESS_RESPONSE,
    });

    await studentRegister(VALID_PAYLOAD);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers?.['Content-Type']).toBe('application/json');
  });

  it('serializes payload as JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => SUCCESS_RESPONSE,
    });

    await studentRegister(VALID_PAYLOAD);

    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.email).toBe(VALID_PAYLOAD.email);
    expect(body.nome).toBe(VALID_PAYLOAD.nome);
    expect(body.matricula).toBe(VALID_PAYLOAD.matricula);
  });

  it('returns the response data on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => SUCCESS_RESPONSE,
    });

    const result = await studentRegister(VALID_PAYLOAD);

    expect(result).toEqual(SUCCESS_RESPONSE);
  });

  it('throws an error on 400 response (duplicate email)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ email: ['Este e-mail já está em uso.'] }),
    });

    await expect(studentRegister(VALID_PAYLOAD)).rejects.toThrow();
  });

  it('throws an error on 400 response (weak password)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        password: ['A senha deve ter no mínimo 8 caracteres e conter letras e números.'],
      }),
    });

    await expect(studentRegister({ ...VALID_PAYLOAD, password: 'weak' })).rejects.toThrow();
  });

  it('includes error data in thrown error', async () => {
    const errorData = { email: ['Este e-mail já está em uso.'] };
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => errorData,
    });

    let caught: Error | null = null;
    try {
      await studentRegister(VALID_PAYLOAD);
    } catch (e) {
      caught = e as Error;
    }

    expect(caught).not.toBeNull();
    // O erro deve carregar os dados da resposta
    expect((caught as any).data || caught?.message).toBeTruthy();
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

    await expect(studentRegister(VALID_PAYLOAD)).rejects.toThrow('Network request failed');
  });
});

const ORG_PAYLOAD = {
  email: 'contato@ong.org',
  password: 'Senha123',
  cnpj: '12.345.678/0001-90',
  razao_social: 'ONG Exemplo',
  nome_fantasia: 'ONG Exemplo',
  telefone: '(61) 3333-4444',
  nome_responsavel: 'João Responsável',
};

const ORG_SUCCESS_RESPONSE = {
  id: 'uuid-456',
  email: 'contato@ong.org',
  nome: 'João Responsável',
  role: 'organizacao',
  organization_profile: {
    cnpj: '12.345.678/0001-90',
    razao_social: 'ONG Exemplo',
    nome_fantasia: 'ONG Exemplo',
    telefone: '(61) 3333-4444',
    nome_responsavel: 'João Responsável',
    status: 'pending',
  },
  tokens: {
    access: 'eyJaccess...',
    refresh: 'eyJrefresh...',
  },
};

describe('api.organizationRegister', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('calls the correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ORG_SUCCESS_RESPONSE,
    });

    await organizationRegister(ORG_PAYLOAD);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/v1/auth/register/organization/');
  });

  it('uses POST method', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ORG_SUCCESS_RESPONSE,
    });

    await organizationRegister(ORG_PAYLOAD);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('POST');
  });

  it('serializes payload as JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ORG_SUCCESS_RESPONSE,
    });

    await organizationRegister(ORG_PAYLOAD);

    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.email).toBe(ORG_PAYLOAD.email);
    expect(body.cnpj).toBe(ORG_PAYLOAD.cnpj);
  });
});
