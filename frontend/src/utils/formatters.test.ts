import { formatCNPJ, formatPhone } from './formatters';

describe('formatters', () => {
  describe('formatCNPJ', () => {
    test('should format raw digits correctly', () => {
      expect(formatCNPJ('12345678000199')).toBe('12.345.678/0001-99');
    });

    test('should handle partial values', () => {
      expect(formatCNPJ('12')).toBe('12');
      expect(formatCNPJ('123')).toBe('12.3');
    });

    test('should limit length', () => {
      expect(formatCNPJ('12345678000199000')).toBe('12.345.678/0001-99');
    });
  });

  describe('formatPhone', () => {
    test('should format mobile phones (11 digits)', () => {
      expect(formatPhone('61988887777')).toBe('(61) 98888-7777');
    });

    test('should format landlines (10 digits)', () => {
      expect(formatPhone('6133334444')).toBe('(61) 3333-4444');
    });

    test('should handle partial values', () => {
      expect(formatPhone('61')).toBe('61');
      expect(formatPhone('619')).toBe('(61) 9');
    });
  });
});
