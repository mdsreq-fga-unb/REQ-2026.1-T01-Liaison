import { Platform } from 'react-native';
import { apiUrl } from '../config/api';

// ── Profile API Types ──────────────────────────────────────────────

export interface GalleryPhoto {
  id: string;
  image_url: string;
  created_at: string;
}

export interface StatsData {
  total_hours_completed: number;
  total_hours_required: number;
  total_events: number;
}

export interface EventData {
  category: string;
  title: string;
  organization: string;
  date: string;
  status: 'concluído' | 'em_andamento';
  hours: number;
}

export interface ProfileData {
  id: string;
  email: string;
  nome: string;
  universidade: string;
  curso: string;
  matricula: string;
  semestre_atual: number | null;
  turno: string | null;
  ano_conclusao: number | null;
  horas_extensao_exigidas: number | null;
  interesses: string[];
  bio: string;
  avatar_url: string | null;
  banner_url: string | null;
  gallery: GalleryPhoto[];
  stats: StatsData;
  events: EventData[];
}

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

export async function appendFileToForm(formData: FormData, field: string, file: UploadFile): Promise<void> {
  if (Platform.OS === 'web') {
    const res = await fetch(file.uri);
    const blob = await res.blob();
    formData.append(field, blob, file.name);
  } else {
    formData.append(field, { uri: file.uri, name: file.name, type: file.type } as any);
  }
}

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
};

export interface LoginPayload {
  email?: string;
  cnpj?: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  role: string;
  nome: string;
  email: string;
  id: string;
}

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

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const url = apiUrl('/auth/login/');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError('Login failed', data, response.status);
  }

  return data as LoginResponse;
}

/**
 * Refresh expired access token using the stored refresh token.
 * POST /auth/token/refresh/ — backend uses simplejwt with rotating tokens.
 * Returns new { access, refresh } pair on success.
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ access: string; refresh: string }> {
  const url = apiUrl('/auth/token/refresh/');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError('Token refresh failed', data, response.status);
  }

  return data as { access: string; refresh: string };
}

/**
 * Create authorization headers for an authenticated request.
 * Use with fetch() to attach Bearer token.
 *
 * @example
 *   fetch(url, { headers: authHeaders(token), body: ... })
 */
export function authHeaders(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Perform an authenticated fetch request.
 * Automatically attaches the Bearer token and JSON content-type.
 * Useful as a convenience wrapper for protected API endpoints.
 */
export async function fetchWithAuth(
  url: string,
  token: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
      ...(options.headers as Record<string, string> | undefined),
    },
  });
}

// ── Profile API Functions ──────────────────────────────────────────

/**
 * Fetch the authenticated student's profile data.
 * GET /students/me/
 */
export async function getStudentProfile(token: string): Promise<ProfileData> {
  const url = apiUrl('/students/me/');
  const response = await fetch(url, {
    headers: { ...authHeaders(token) },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError('Failed to fetch profile', data, response.status);
  }
  return data as ProfileData;
}

/**
 * Update the authenticated student's profile.
 * PATCH /students/me/update/
 */
export async function updateStudentProfile(
  token: string,
  data: Partial<ProfileData>,
): Promise<ProfileData> {
  const url = apiUrl('/students/me/update/');
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });
  const responseData = await response.json();
  if (!response.ok) {
    throw new ApiError('Failed to update profile', responseData, response.status);
  }
  return responseData as ProfileData;
}

/**
 * Upload a new avatar image for the student.
 * POST /students/me/avatar/ (multipart/form-data)
 */
export async function uploadAvatar(
  token: string,
  file: UploadFile,
): Promise<{ avatar_url: string }> {
  const url = apiUrl('/students/me/avatar/');
  const formData = new FormData();
  await appendFileToForm(formData, 'avatar', file);

  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError('Failed to upload avatar', data, response.status);
  }
  return data as { avatar_url: string };
}

/**
 * Upload a new banner image for the student.
 * POST /students/me/banner/ (multipart/form-data)
 */
export async function uploadBanner(
  token: string,
  file: UploadFile,
): Promise<{ banner_url: string }> {
  const url = apiUrl('/students/me/banner/');
  const formData = new FormData();
  await appendFileToForm(formData, 'banner', file);

  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError('Failed to upload banner', data, response.status);
  }
  return data as { banner_url: string };
}

/**
 * Upload multiple gallery photos.
 * POST /students/me/gallery/ (multipart/form-data)
 */
export async function uploadGalleryPhotos(
  token: string,
  files: UploadFile[],
): Promise<GalleryPhoto[]> {
  const url = apiUrl('/students/me/gallery/');
  const formData = new FormData();
  for (const file of files) {
    await appendFileToForm(formData, 'images', file);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError('Failed to upload gallery photos', data, response.status);
  }
  return data as GalleryPhoto[];
}

/**
 * Delete a gallery photo by ID.
 * DELETE /students/me/gallery/{photoId}/
 */
export async function deleteGalleryPhoto(
  token: string,
  photoId: string,
): Promise<void> {
  const url = apiUrl(`/students/me/gallery/${photoId}/`);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!response.ok) {
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    throw new ApiError('Failed to delete gallery photo', data, response.status);
  }
}

/**
 * Change the authenticated student's password.
 * POST /students/me/change-password/
 */
export async function changePassword(
  token: string,
  newPassword: string,
  confirmPassword: string,
): Promise<{ detail: string }> {
  const url = apiUrl('/students/me/change-password/');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError('Failed to change password', data, response.status);
  }
  return data as { detail: string };
}

// ── Organization Profile API Types ─────────────────────────────────

export interface OrgGalleryPhoto {
  id: string;
  image_url: string;
  created_at: string;
}

export interface OrgStatsData {
  total_events: number;
  total_volunteers: number;
  rating: number;
}

export interface OrgProfileData {
  id: string;
  email: string;
  nome: string;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  telefone: string;
  nome_responsavel: string;
  mission: string;
  full_description: string;
  areas_de_atuacao: string[];
  site: string;
  endereco: string;
  logo_url: string | null;
  banner_url: string | null;
  gallery: OrgGalleryPhoto[];
  stats: OrgStatsData;
  events: [];
  open_positions: [];
}

// ── Organization Profile API Functions ─────────────────────────────

/**
 * Fetch the authenticated organization's profile data.
 * GET /organizations/me/
 */
export async function getOrgProfile(token: string): Promise<OrgProfileData> {
  const url = apiUrl('/organizations/me/');
  const response = await fetch(url, {
    headers: { ...authHeaders(token) },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError('Failed to fetch org profile', data, response.status);
  }
  return data as OrgProfileData;
}

/**
 * Update the authenticated organization's profile.
 * PATCH /organizations/me/update/
 */
export async function updateOrgProfile(
  token: string,
  data: Partial<OrgProfileData>,
): Promise<OrgProfileData> {
  const url = apiUrl('/organizations/me/update/');
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });
  const responseData = await response.json();
  if (!response.ok) {
    throw new ApiError('Failed to update org profile', responseData, response.status);
  }
  return responseData as OrgProfileData;
}

/**
 * Upload a new logo for the organization.
 * POST /organizations/me/logo/ (multipart/form-data)
 */
export async function uploadOrgLogo(
  token: string,
  file: UploadFile,
): Promise<{ logo_url: string }> {
  const url = apiUrl('/organizations/me/logo/');
  const formData = new FormData();
  await appendFileToForm(formData, 'logo', file);

  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError('Failed to upload org logo', data, response.status);
  }
  return data as { logo_url: string };
}

/**
 * Upload a new banner for the organization.
 * POST /organizations/me/banner/ (multipart/form-data)
 */
export async function uploadOrgBanner(
  token: string,
  file: UploadFile,
): Promise<{ banner_url: string }> {
  const url = apiUrl('/organizations/me/banner/');
  const formData = new FormData();
  await appendFileToForm(formData, 'banner', file);

  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError('Failed to upload org banner', data, response.status);
  }
  return data as { banner_url: string };
}

/**
 * Upload multiple gallery photos for the organization.
 * POST /organizations/me/gallery/ (multipart/form-data)
 */
export async function uploadOrgGallery(
  token: string,
  files: UploadFile[],
): Promise<OrgGalleryPhoto[]> {
  const url = apiUrl('/organizations/me/gallery/');
  const formData = new FormData();
  for (const file of files) {
    await appendFileToForm(formData, 'images', file);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError('Failed to upload org gallery', data, response.status);
  }
  return data as OrgGalleryPhoto[];
}

/**
 * Delete an organization gallery photo by ID.
 * DELETE /organizations/me/gallery/{photoId}/
 */
export async function deleteOrgGalleryPhoto(
  token: string,
  photoId: string,
): Promise<void> {
  const url = apiUrl(`/organizations/me/gallery/${photoId}/`);
  const response = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    throw new ApiError('Failed to delete org gallery photo', errorData, response.status);
  }
}

/**
 * Change the authenticated organization's password.
 * POST /organizations/me/change-password/
 */
export async function changeOrgPassword(
  token: string,
  newPassword: string,
  confirmPassword: string,
): Promise<{ detail: string }> {
  const url = apiUrl('/organizations/me/change-password/');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new ApiError('Failed to change org password', data, response.status);
  }
  return data as { detail: string };
}
