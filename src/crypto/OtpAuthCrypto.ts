import { PassCrypto, PassCryptoImpl } from './PassCryptoInterface';
import * as Speakeasy from 'speakeasy'; // TODO: replace this module. not maintained
import * as crypto from 'crypto';

// type OtpAuthCryptoSessionDataForGenerate = {};
// type OtpAuthCryptoClientDataForGenerate = {};
type OtpAuthCryptoUserInputForGenerate = {
  username: string;
};
type OtpAuthCryptoSecretData = {
  secret: string;
};
type OtpAuthCryptoResultOfGenerate = {
  otpauth_url: string;
};
// type OtpAuthCryptoSessionDataForVerify = {};
// type OtpAuthCryptoClientDataForVerify = {};
type OtpAuthCryptoUserInputForVerify = {
  pass: string;
};

const OtpAuthCryptoImpl: PassCryptoImpl<
  OtpAuthCryptoUserInputForGenerate,
  OtpAuthCryptoSecretData,
  OtpAuthCryptoResultOfGenerate,
  OtpAuthCryptoUserInputForVerify
> = {
  // beginToGenerate():
  //   | {
  //       session: OtpAuthCryptoSessionDataForGenerate;
  //       client: OtpAuthCryptoClientDataForGenerate;
  //     }
  //   | Error {
  //   throw new Error('Method not implemented.');
  // },
  generate(
    // session: OtpAuthCryptoSessionDataForGenerate,
    // client: OtpAuthCryptoClientDataForGenerate,
    input: OtpAuthCryptoUserInputForGenerate
  ):
    | { secret: OtpAuthCryptoSecretData; result: OtpAuthCryptoResultOfGenerate }
    | Error {
    const secret = Speakeasy.generateSecret({
      length: 32,
      name: crypto.randomUUID() + ':' + input.username,
    });
    return {
      secret: { secret: secret.base32 },
      result: { otpauth_url: secret.otpauth_url },
    };
  },
  // beginToVerify():
  //   | {
  //       session: OtpAuthCryptoSessionDataForVerify;
  //       client: OtpAuthCryptoClientDataForVerify;
  //     }
  //   | Error {
  //   throw new Error('Method not implemented.');
  // },
  verify(
    secret: OtpAuthCryptoSecretData,
    // session: OtpAuthCryptoSessionDataForVerify,
    // client: OtpAuthCryptoClientDataForVerify,
    input: OtpAuthCryptoUserInputForVerify
  ): boolean {
    return true;
    // return Speakeasy.totp.verify({
    //   secret: secret.secret,
    //   encoding: 'base32',
    //   token: input.pass,
    // });
  },
};

// object にしてしまったら意味が無い…
// ただクライアントとやりとりする間に型は失うので、どこまで型を引っ張るかは検討
export const OtpAuthCrypto: PassCrypto = {
  generate: function (
    input: object
  ): Error | { secret: object; result: object } {
    const { username } = input as any;
    if (typeof username !== 'string') return new Error();
    const newInput = { username };
    return OtpAuthCryptoImpl.generate(newInput);
  },
  verify: function (secret: object, input: object): boolean {
    // TODO: validate
    return OtpAuthCryptoImpl.verify(secret as any, input as any);
  },
};
