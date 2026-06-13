import {
  studentRegister,
  organizationRegister,
  login,
  getStudentProfile,
  updateStudentProfile,
  uploadAvatar,
  uploadBanner,
  uploadGalleryPhotos,
  deleteGalleryPhoto,
  changePassword,
  ApiError,
} from './api';

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

const LOGIN_PAYLOAD = {
  email: 'maria@email.edu.br',
  password: 'Senha123',
};

const LOGIN_SUCCESS_RESPONSE = {
  access: 'eyJaccess...',
  refresh: 'eyJrefresh...',
  role: 'estudante',
  nome: 'Maria Silva',
  id: 'uuid-maria',
};

describe('api.login', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('calls the correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => LOGIN_SUCCESS_RESPONSE,
    });

    await login(LOGIN_PAYLOAD);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/v1/auth/login/');
  });

  it('uses POST method', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => LOGIN_SUCCESS_RESPONSE,
    });

    await login(LOGIN_PAYLOAD);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.method).toBe('POST');
  });

  it('sends JSON content-type header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => LOGIN_SUCCESS_RESPONSE,
    });

    await login(LOGIN_PAYLOAD);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers?.['Content-Type']).toBe('application/json');
  });

  it('serializes email and password in body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => LOGIN_SUCCESS_RESPONSE,
    });

    await login(LOGIN_PAYLOAD);

    const [, options] = mockFetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.email).toBe(LOGIN_PAYLOAD.email);
    expect(body.password).toBe(LOGIN_PAYLOAD.password);
  });

  it('returns the response data on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => LOGIN_SUCCESS_RESPONSE,
    });

    const result = await login(LOGIN_PAYLOAD);

    expect(result).toEqual(LOGIN_SUCCESS_RESPONSE);
  });

  it('returns access, refresh, role, nome, id in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => LOGIN_SUCCESS_RESPONSE,
    });

    const result = await login(LOGIN_PAYLOAD);

    expect(result.access).toBe('eyJaccess...');
    expect(result.refresh).toBe('eyJrefresh...');
    expect(result.role).toBe('estudante');
    expect(result.nome).toBe('Maria Silva');
    expect(result.id).toBe('uuid-maria');
  });

  it('throws ApiError on 401 response (invalid credentials)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'No active account found with the given credentials' }),
    });

    await expect(login(LOGIN_PAYLOAD)).rejects.toThrow('Login failed');
  });

  it('includes status 401 in ApiError for invalid credentials', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'No active account found with the given credentials' }),
    });

    let caught: Error | null = null;
    try {
      await login(LOGIN_PAYLOAD);
    } catch (e) {
      caught = e as Error;
    }

    expect(caught).not.toBeNull();
    expect((caught as any).status).toBe(401);
  });

  it('throws on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

    await expect(login(LOGIN_PAYLOAD)).rejects.toThrow('Network request failed');
  });
});

// ── Profile API Tests ────────────────────────────────────────────

const MOCK_TOKEN = 'eyJaccess-token...';
const MOCK_PROFILE = {
  id: 'uuid-profile',
  email: 'maria@email.edu.br',
  nome: 'Maria Silva',
  universidade: 'UnB',
  curso: 'Ciência da Computação',
  matricula: '2024001234',
  semestre_atual: 6,
  turno: 'noturno',
  ano_conclusao: 2027,
  horas_extensao_exigidas: 200,
  interesses: ['educacao', 'tecnologia'],
  bio: 'Estudante apaixonada por tecnologia.',
  avatar_url: 'http://localhost:8000/media/avatars/photo.jpg',
  banner_url: 'http://localhost:8000/media/banners/banner.jpg',
  gallery: [
    { id: 'photo-1', image_url: 'http://localhost:8000/media/gallery/img1.jpg', created_at: '2026-06-08T00:00:00Z' },
  ],
  stats: {
    total_hours_completed: 120,
    total_hours_required: 200,
    total_events: 8,
  },
  events: [
    {
      category: 'tecnologia',
      title: 'Hackathon Solidário',
      organization: 'Tech4Good',
      date: '2026-05-20',
      status: 'concluído',
      hours: 20,
    },
  ],
};

describe('api.getStudentProfile', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('calls the correct endpoint with Bearer token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => MOCK_PROFILE,
    });

    await getStudentProfile(MOCK_TOKEN);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/v1/students/me/');
    expect(options?.headers?.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
  });

  it('returns the profile data on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => MOCK_PROFILE,
    });

    const result = await getStudentProfile(MOCK_TOKEN);
    expect(result).toEqual(MOCK_PROFILE);
    expect(result.nome).toBe('Maria Silva');
    expect(result.stats.total_hours_completed).toBe(120);
  });

  it('throws ApiError on failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Authentication credentials were not provided.' }),
    });

    await expect(getStudentProfile('invalid-token')).rejects.toThrow('Failed to fetch profile');
  });
});

describe('api.updateStudentProfile', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('calls PATCH with JSON body and Bearer token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => MOCK_PROFILE,
    });

    const updateData = { nome: 'Maria Souza', bio: 'Nova bio' };
    await updateStudentProfile(MOCK_TOKEN, updateData);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/v1/students/me/update/');
    expect(options.method).toBe('PATCH');
    expect(options.headers?.['Content-Type']).toBe('application/json');
    expect(options.headers?.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
    const body = JSON.parse(options.body);
    expect(body.nome).toBe('Maria Souza');
    expect(body.bio).toBe('Nova bio');
  });

  it('returns updated profile data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ...MOCK_PROFILE, nome: 'Maria Souza' }),
    });

    const result = await updateStudentProfile(MOCK_TOKEN, { nome: 'Maria Souza' });
    expect(result.nome).toBe('Maria Souza');
  });

  it('throws ApiError on validation failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ email: ['Este campo não pode ser alterado.'] }),
    });

    await expect(
      updateStudentProfile(MOCK_TOKEN, { email: 'new@test.com' } as any),
    ).rejects.toThrow('Failed to update profile');
  });
});

describe('api.uploadAvatar', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('sends multipart form data with Bearer token (no Content-Type)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ avatar_url: 'http://localhost:8000/media/avatars/new.jpg' }),
    });

    const file = { uri: 'file:///photo.jpg', name: 'photo.jpg', type: 'image/jpeg' };
    await uploadAvatar(MOCK_TOKEN, file);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/v1/students/me/avatar/');
    expect(options.method).toBe('POST');
    expect(options.headers?.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
    // FormData should NOT have Content-Type set (let browser set boundary)
    expect(options.headers?.['Content-Type']).toBeUndefined();
    expect(options.body).toBeInstanceOf(FormData);
  });

  it('returns avatar_url on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ avatar_url: 'http://localhost:8000/media/avatars/new.jpg' }),
    });

    const file = { uri: 'file:///photo.jpg', name: 'photo.jpg', type: 'image/jpeg' };
    const result = await uploadAvatar(MOCK_TOKEN, file);
    expect(result.avatar_url).toBe('http://localhost:8000/media/avatars/new.jpg');
  });
});

describe('api.uploadBanner', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('sends multipart form data with Bearer token', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ banner_url: 'http://localhost:8000/media/banners/new.jpg' }),
    });

    const file = { uri: 'file:///banner.jpg', name: 'banner.jpg', type: 'image/jpeg' };
    await uploadBanner(MOCK_TOKEN, file);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/v1/students/me/banner/');
    expect(options.method).toBe('POST');
    expect(options.headers?.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
    expect(options.body).toBeInstanceOf(FormData);
  });
});

describe('api.uploadGalleryPhotos', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('sends multiple files as multipart form data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => [
        { id: 'p1', image_url: 'http://localhost:8000/media/gallery/p1.jpg', created_at: '2026-06-08T00:00:00Z' },
        { id: 'p2', image_url: 'http://localhost:8000/media/gallery/p2.jpg', created_at: '2026-06-08T00:00:00Z' },
      ],
    });

    const files = [
      { uri: 'file:///g1.jpg', name: 'g1.jpg', type: 'image/jpeg' },
      { uri: 'file:///g2.jpg', name: 'g2.jpg', type: 'image/jpeg' },
    ];
    await uploadGalleryPhotos(MOCK_TOKEN, files);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/v1/students/me/gallery/');
    expect(options.method).toBe('POST');
    expect(options.headers?.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
    expect(options.body).toBeInstanceOf(FormData);
  });

  it('returns array of gallery photos on success', async () => {
    const responseData = [
      { id: 'p1', image_url: 'http://localhost:8000/media/gallery/p1.jpg', created_at: '2026-06-08T00:00:00Z' },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => responseData,
    });

    const files = [{ uri: 'file:///g1.jpg', name: 'g1.jpg', type: 'image/jpeg' }];
    const result = await uploadGalleryPhotos(MOCK_TOKEN, files);
    expect(result).toEqual(responseData);
  });
});

describe('api.deleteGalleryPhoto', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('sends DELETE with Bearer token to correct photo URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    });

    await deleteGalleryPhoto(MOCK_TOKEN, 'photo-123');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/v1/students/me/gallery/photo-123/');
    expect(options.method).toBe('DELETE');
    expect(options.headers?.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
  });

  it('throws ApiError on failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ detail: 'Foto não encontrada.' }),
    });

    await expect(deleteGalleryPhoto(MOCK_TOKEN, 'bad-id')).rejects.toThrow('Failed to delete gallery photo');
  });
});

describe('api.changePassword', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('sends POST with new_password and confirm_password in JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ detail: 'Senha alterada com sucesso.' }),
    });

    await changePassword(MOCK_TOKEN, 'NovaSenha123', 'NovaSenha123');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/v1/students/me/change-password/');
    expect(options.method).toBe('POST');
    expect(options.headers?.['Content-Type']).toBe('application/json');
    expect(options.headers?.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
    const body = JSON.parse(options.body);
    expect(body.new_password).toBe('NovaSenha123');
    expect(body.confirm_password).toBe('NovaSenha123');
  });

  it('returns detail message on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ detail: 'Senha alterada com sucesso.' }),
    });

    const result = await changePassword(MOCK_TOKEN, 'NovaSenha123', 'NovaSenha123');
    expect(result.detail).toBe('Senha alterada com sucesso.');
  });

  it('throws ApiError on password mismatch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ confirm_password: ['As senhas não coincidem.'] }),
    });

    await expect(
      changePassword(MOCK_TOKEN, 'Senha123', 'Different123'),
    ).rejects.toThrow('Failed to change password');
  });
});
