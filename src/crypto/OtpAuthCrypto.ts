import { PassCryptoWithoutSalt } from './PassCryptoInterface';
import * as Speakeasy from 'speakeasy'; // TODO: replace this module. not maintained
import * as crypto from 'crypto';

export class OtpAuthCrypto
  implements
    PassCryptoWithoutSalt<
      { username: string },
      { otpauth_url: string },
      string,
      string
    >
{
  generateKey(reqGen: { username: string }): [{ otpauth_url: string }, string] {
    const secret = Speakeasy.generateSecret({
      length: 32,
      name: crypto.randomUUID() + ':' + reqGen.username,
    });
    return [{ otpauth_url: secret.otpauth_url }, secret.base32];
  }

  verify(pass: string, secret: string): boolean {
    return Speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: pass,
    });
  }
}
