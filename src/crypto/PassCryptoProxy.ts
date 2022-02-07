import { NoPassCrypto } from './NoPassCrypto';
import { OtpAuthCrypto } from './OtpAuthCrypto';
import { PassCrypto } from './PassCryptoInterface';
import { SimplePassCrypto } from './SimplePassCrypto';

export type PassCryptoMode = 'otpauth' | 'nopass' | 'pass';

export function convertToPassCryptoMode(t: string): PassCryptoMode | null {
  return t === 'otpauth' || t === 'nopass' || t === 'pass' ? t : null;
}

export function getPassCryptoInstance(mode: PassCryptoMode): PassCrypto {
  if (mode === 'otpauth') return OtpAuthCrypto;
  else if (mode === 'nopass') return NoPassCrypto;
  else return SimplePassCrypto;
}

// export class PassCryptoProxy implements PassCrypto {
//   crypto: PassCrypto;
//   constructor(type: 'otpauth' | 'nopass' | 'pass') {
//     if (type === 'otpauth') this.crypto = OtpAuthCrypto;
//     else if (type === 'nopass') this.crypto = NoPassCrypto;
//     else this.crypto = SimplePassCrypto;
//   }
//   generate(input: object): Error | { secret: object; result: object } {
//     return this.crypto.generate(input);
//   }
//   verify(secret: object, input: object): boolean {
//     return this.crypto.verify(secret, input);
//   }
// }
