// TODO: work in progress

import { OtpAuthCrypto } from './OtpAuthCrypto';
import { PassCrypto } from './PassCryptoInterface';

export class PassCryptoProxy implements PassCrypto {
  crypto: PassCrypto;
  constructor(type: 'otpauth') {
    this.crypto = OtpAuthCrypto;
  }
  generate(input: object): Error | { secret: object; result: object } {
    return this.crypto.generate(input);
  }
  verify(secret: object, input: object): boolean {
    return this.crypto.verify(secret, input);
  }
}
