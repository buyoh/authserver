import { PassCrypto, PassCryptoImpl } from './PassCryptoInterface';
import { randomBytes, scryptSync } from 'crypto';

type SimplePassCryptoUserInputForGenerate = {
  username: string;
  pass?: string;
};
type SimplePassCryptoSecretData = {
  salt: string;
  hash: string;
};
type SimplePassCryptoResultOfGenerate = {
  pass?: string;
};
type SimplePassCryptoUserInputForVerify = {
  username: string;
  pass?: string;
};

export function isValidPassword(password: string): boolean {
  return 4 <= password.length && password.length <= 200;
}

const SimplePassCryptoImpl: PassCryptoImpl<
  SimplePassCryptoUserInputForGenerate,
  SimplePassCryptoSecretData,
  SimplePassCryptoResultOfGenerate,
  SimplePassCryptoUserInputForVerify
> = {
  generate(input: SimplePassCryptoUserInputForGenerate):
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
    const hash = scryptSync(pass + ' ' + input.username, salt, 64).toString(
      'hex'
    );
    return {
      secret: { salt: salt.toString('hex'), hash },
      result: { pass: generatePass ? pass : undefined },
    };
  },
  verify(
    secret: SimplePassCryptoSecretData,
    input: SimplePassCryptoUserInputForVerify
  ): boolean {
    const salt = Buffer.from(secret.salt, 'hex');
    const hash = scryptSync(
      input.pass + ' ' + input.username,
      salt,
      64
    ).toString('hex');
    return secret.hash === hash;
  },
};

// any にしてしまったら意味が無い…
// ただクライアントとやりとりする間に型は失うので、どこまで型を引っ張るかは検討
export const SimplePassCrypto: PassCrypto = {
  generate: function (input: any): Error | { secret: any; result: any } {
    return SimplePassCryptoImpl.generate(input);
  },
  verify: function (secret: any, input: any): boolean {
    return SimplePassCryptoImpl.verify(secret, input);
  },
};
