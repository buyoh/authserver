import {
  PassCrypto,
  PassCryptoImpl,
  PassCryptoValidator,
} from './PassCryptoServerInterface';
import * as Speakeasy from 'speakeasy'; // TODO: replace this module. not maintained
import * as crypto from 'crypto';
import * as t from 'io-ts';

const OtpAuthCryptoValidator: PassCryptoValidator = {
  UserInputForGenerate: t.type({}),
  SecretData: t.type({
    secret: t.string,
  }),
  UserResultOfGenerate: t.type({
    otpauth_url: t.string,
  }),
  UserInputForVerify: t.type({
    pass: t.string,
  }),
};

type OtpAuthCryptoUserInputForGenerate = t.TypeOf<
  typeof OtpAuthCryptoValidator.UserInputForGenerate
>;
type OtpAuthCryptoSecretData = t.TypeOf<
  typeof OtpAuthCryptoValidator.SecretData
>;
type OtpAuthCryptoResultOfGenerate = t.TypeOf<
  typeof OtpAuthCryptoValidator.UserResultOfGenerate
>;
type OtpAuthCryptoUserInputForVerify = t.TypeOf<
  typeof OtpAuthCryptoValidator.UserInputForVerify
>;

export const OtpAuthCryptoImpl: PassCryptoImpl<
  OtpAuthCryptoUserInputForGenerate,
  OtpAuthCryptoSecretData,
  OtpAuthCryptoResultOfGenerate,
  OtpAuthCryptoUserInputForVerify
> = {
  validator: OtpAuthCryptoValidator,
  generate(
    username: string,
    _input: OtpAuthCryptoUserInputForGenerate
  ):
    | { secret: OtpAuthCryptoSecretData; result: OtpAuthCryptoResultOfGenerate }
    | Error {
    const secret = Speakeasy.generateSecret({
      length: 32,
      name: crypto.randomUUID() + ':' + username,
    });
    if (secret.otpauth_url === undefined) throw Error('crypto error');
    return {
      secret: { secret: secret.base32 },
      result: { otpauth_url: secret.otpauth_url },
    };
  },
  verify(
    _username: string,
    secret: OtpAuthCryptoSecretData,
    input: OtpAuthCryptoUserInputForVerify
  ): boolean {
    return Speakeasy.totp.verify({
      secret: secret.secret,
      encoding: 'base32',
      token: input.pass,
    });
  },
};
