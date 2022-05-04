import { NoPassCrypto } from './NoPassCrypto';
import { OtpAuthCrypto } from './OtpAuthCrypto';
import { PassCryptoMode } from './PassCrypto';
import { PassCrypto } from './PassCryptoServerInterface';
import { SimplePassCrypto } from './SimplePassCrypto';

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
