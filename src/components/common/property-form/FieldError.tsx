import { type ValidationResult } from '@/constants/validation';

export function FieldError({ error }: { error?: ValidationResult | null }) {
  if (!error || error.isValid) return null;
  return <span className="text-xs text-red-500 mt-1 block">{error.message}</span>;
}
