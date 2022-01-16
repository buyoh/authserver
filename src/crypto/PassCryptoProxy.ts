// TODO: work in progress

import { OtpAuthCrypto } from './OtpAuthCrypto';
import { PassCrypto } from './PassCryptoInterface';

// TODO: UserProfileManagerImpl 等の上位層の実装が出来ていないので、つじつま合わせの実装
export class PassCryptoProxy implements PassCrypto {
  crypto: PassCrypto;
  constructor(type: 'otpauth') {
    this.crypto = OtpAuthCrypto;
  }
  beginToGenerate(): { session: any; client: any } | Error {
    return this.crypto.beginToGenerate();
  }
  generate(
    session: any,
    client: any,
    input: any
  ): Error | { secret: any; result: any } {
    return this.crypto.generate(session, client, input);
  }
  beginToVerify(secret: any): Error | { session: any; client: any } {
    return this.crypto.beginToVerify(secret);
  }
  verify(secret: any, session: any, client: any, input: any): boolean {
    return this.crypto.verify(secret, session, client, input);
  }
}
