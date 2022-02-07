import { PassCrypto, PassCryptoImpl } from './PassCryptoInterface';
import { randomBytes, scryptSync } from 'crypto';

type SimplePassCryptoUserInputForGenerate = {
  username: string;
  pass: string;
};
type SimplePassCryptoSecretData = {
  salt: string;
  hash: string;
};
type SimplePassCryptoResultOfGenerate = {};
type SimplePassCryptoUserInputForVerify = {
  username: string;
  pass: string;
};

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
    if (input.pass === '') return new Error('pass is empty');
    // TODO: support async!
    const salt = randomBytes(64);
    const hash = scryptSync(
      input.pass + ' ' + input.username,
      salt,
      64
    ).toString('hex');
    return {
      secret: { salt: salt.toString('hex'), hash },
      result: {},
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
