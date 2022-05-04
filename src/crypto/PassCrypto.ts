// These types/functions shall be able to be called from both web and nodejs.

export type PassCryptoMode = 'otpauth' | 'nopass' | 'pass';
export const kPassCryptoList = [
  'otpauth',
  'nopass',
  'pass',
] as PassCryptoMode[];

export function convertToPassCryptoMode(t: string): PassCryptoMode | null {
  return t === 'otpauth' || t === 'nopass' || t === 'pass' ? t : null;
}
