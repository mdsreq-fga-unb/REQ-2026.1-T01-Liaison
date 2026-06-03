import { apiUrl } from '../config/api';

export interface StudentRegisterPayload {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
  universidade: string;
  curso: string;
  matricula: string;
  semestre_atual?: number | null;
  turno?: 'matutino' | 'vespertino' | 'noturno' | 'integral' | null;
  ano_conclusao?: number | null;
  horas_extensao_exigidas?: number | null;
  interesses?: string[];
}

export type OrganizationRegisterPayload = {
  email: string;
  password: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  telefone: string;
  nome_responsavel: string;
};

export interface StudentRegisterResponse {
  id: string;
  email: string;
  nome: string;
  role: string;
  student_profile: {
    universidade: string;
    curso: string;
    matricula: string;
    semestre_atual?: number | null;
    turno?: string | null;
    ano_conclusao?: number | null;
    horas_extensao_exigidas?: number | null;
    interesses: string[];
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

export type OrganizationRegisterResponse = {
  id: string;
  email: string;
  nome: string;
  role: string;
  organization_profile: {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    telefone: string;
    nome_responsavel: string;
    status: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
};

export class ApiError extends Error {
  data: unknown;
  status: number;

  constructor(message: string, data: unknown, status: number) {
    super(message);
    this.name = 'ApiError';
    this.data = data;
    this.status = status;
  }
}

export async function studentRegister(
  payload: StudentRegisterPayload,
): Promise<StudentRegisterResponse> {
  const url = apiUrl('/auth/register/student/');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      `Registration failed with status ${response.status}`,
      data,
      response.status,
    );
  }

  return data as StudentRegisterResponse;
}

export async function organizationRegister(
  payload: OrganizationRegisterPayload,
): Promise<OrganizationRegisterResponse> {
  const url = apiUrl('/auth/register/organization/');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      `Registration failed with status ${response.status}`,
      data,
      response.status,
    );
  }

  return data as OrganizationRegisterResponse;
}

export async function checkEmail(
  email: string,
): Promise<{ available: boolean }> {
  const url = apiUrl('/auth/check-email/');

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new ApiError(
      'Network error',
      { email: ['Não foi possível verificar o e-mail. Verifique sua conexão.'] },
      0,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      'Parse error',
      { email: ['Erro ao verificar e-mail. Tente novamente.'] },
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `Email check failed with status ${response.status}`,
      data,
      response.status,
    );
  }

  return data as { available: boolean };
}

export async function checkMatricula(
  matricula: string,
): Promise<{ available: boolean }> {
  const url = apiUrl('/auth/check-matricula/');

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricula }),
    });
  } catch {
    throw new ApiError(
      'Network error',
      { matricula: ['Não foi possível verificar a matrícula. Verifique sua conexão.'] },
      0,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      'Parse error',
      { matricula: ['Erro ao verificar matrícula. Tente novamente.'] },
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `Matricula check failed with status ${response.status}`,
      data,
      response.status,
    );
  }

  return data as { available: boolean };
}
