import { ApiError } from '../services/api';

/**
 * Extracts field-specific error messages from an ApiError response.
 * Returns a record mapping field names to their first error message.
 */
export function extractFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  
  const data = error.data as Record<string, unknown>;
  if (!data || typeof data !== 'object') return {};
  
  const fieldErrors: Record<string, string> = {};
  for (const [field, messages] of Object.entries(data)) {
    if (field === 'detail') continue;
    const msg = Array.isArray(messages) ? messages[0] : String(messages);
    fieldErrors[field] = msg;
  }
  
  return fieldErrors;
}
