import { OtpAuthCryptoImpl } from './OtpAuthCrypto';
import { SimplePassCryptoImpl } from './SimplePassCrypto';
import { NoPassCryptoImpl } from './NoPassCrypto';
import { PassCryptoMode } from '../PassCrypto';
import { PassCrypto } from './PassCryptoServerInterface';
import { checkType } from '../../base/IoTs';

type Impls =
  | typeof NoPassCryptoImpl
  | typeof SimplePassCryptoImpl
  | typeof OtpAuthCryptoImpl;

export class PassCryptoProxy implements PassCrypto {
  crypto: Impls;

  constructor(mode: PassCryptoMode) {
    if (mode === 'otpauth') this.crypto = OtpAuthCryptoImpl;
    else if (mode === 'nopass') this.crypto = NoPassCryptoImpl;
    else this.crypto = SimplePassCryptoImpl;
  }

  generate(
    username: string,
    input: object
  ): Error | { secret: object; result: object } {
    if (!checkType(this.crypto.validator.UserInputForGenerate, input))
      return new Error('PassCryptoProxy: generate.input validation failed');
    return this.crypto.generate(username, input);
  }

  verify(username: string, secret: object, input: object): boolean {
    if (!checkType(this.crypto.validator.UserInputForVerify, input))
      return false;
    if (!checkType(this.crypto.validator.SecretData, secret)) {
      console.warn('Internal error: PassCryptoProxy: secret validation failed');
      return false;
    }
    return this.crypto.verify(username, secret, input);
  }
}
