import {
  PassCrypto,
  PassCryptoImpl,
  PassCryptoValidator,
} from './PassCryptoServerInterface';
import { randomBytes, scryptSync } from 'crypto';
import * as t from 'io-ts';

const SimplePassCryptoValidator: PassCryptoValidator = {
  UserInputForGenerate: t.type({
    pass: t.union([t.string, t.undefined]),
  }),
  SecretData: t.type({
    salt: t.string,
    hash: t.string,
  }),
  UserResultOfGenerate: t.type({
    pass: t.union([t.string, t.undefined]),
  }),
  UserInputForVerify: t.type({
    pass: t.string,
  }),
};

type SimplePassCryptoUserInputForGenerate = t.TypeOf<
  typeof SimplePassCryptoValidator.UserInputForGenerate
>;
type SimplePassCryptoSecretData = t.TypeOf<
  typeof SimplePassCryptoValidator.SecretData
>;
type SimplePassCryptoResultOfGenerate = t.TypeOf<
  typeof SimplePassCryptoValidator.UserResultOfGenerate
>;
type SimplePassCryptoUserInputForVerify = t.TypeOf<
  typeof SimplePassCryptoValidator.UserInputForVerify
>;

// TODO:
export function isValidPassword(password: string): boolean {
  return 4 <= password.length && password.length <= 200;
}

export const SimplePassCryptoImpl: PassCryptoImpl<
  SimplePassCryptoUserInputForGenerate,
  SimplePassCryptoSecretData,
  SimplePassCryptoResultOfGenerate,
  SimplePassCryptoUserInputForVerify
> = {
  validator: SimplePassCryptoValidator,
  generate(
    username: string,
    input: SimplePassCryptoUserInputForGenerate
  ):
    | {
        secret: SimplePassCryptoSecretData;
        result: SimplePassCryptoResultOfGenerate;
      }
    | Error {
    // TODO: support async!
    const generatePass = !input.pass;
    const pass = generatePass
      ? randomBytes(4).toString('hex')
      : '' + input.pass;
    if (!isValidPassword(pass)) return new Error('pass is invalid');

    const salt = randomBytes(64);
    const hash = scryptSync(pass + ' ' + username, salt, 64).toString('hex');
    return {
      secret: { salt: salt.toString('hex'), hash },
      result: { pass: generatePass ? pass : undefined },
    };
  },
  verify(
    username: string,
    secret: SimplePassCryptoSecretData,
    input: SimplePassCryptoUserInputForVerify
  ): boolean {
    const salt = Buffer.from(secret.salt, 'hex');
    const hash = scryptSync(input.pass + ' ' + username, salt, 64).toString(
      'hex'
    );
    return secret.hash === hash;
  },
};
