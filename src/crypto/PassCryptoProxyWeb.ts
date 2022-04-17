// TODO: FIXME: shall not depend on crypto in nodejs

export type PassCryptoMode = 'otpauth' | 'nopass' | 'pass';
export const kPassCryptoList = [
  'otpauth',
  'nopass',
  'pass',
] as PassCryptoMode[];
