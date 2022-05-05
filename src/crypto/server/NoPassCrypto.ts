/* eslint-disable @typescript-eslint/no-unused-vars */
import { PassCrypto, PassCryptoImpl } from './PassCryptoServerInterface';

type NoPassCryptoUserInputForGenerate = {};
type NoPassCryptoSecretData = {};
type NoPassCryptoResultOfGenerate = {};
type NoPassCryptoUserInputForVerify = {
  // pass: string;
};

const NoPassCryptoImpl: PassCryptoImpl<
  NoPassCryptoUserInputForGenerate,
  NoPassCryptoSecretData,
  NoPassCryptoResultOfGenerate,
  NoPassCryptoUserInputForVerify
> = {
  generate(
    _username: string,
    _input: NoPassCryptoUserInputForGenerate
  ):
    | {
        secret: NoPassCryptoSecretData;
        result: NoPassCryptoResultOfGenerate;
      }
    | Error {
    return {
      secret: {},
      result: {},
    };
  },
  verify(
    _username: string,
    _secret: NoPassCryptoSecretData,
    _input: NoPassCryptoUserInputForVerify
  ): boolean {
    return true;
  },
};

// any にしてしまったら意味が無い…
// ただクライアントとやりとりする間に型は失うので、どこまで型を引っ張るかは検討
export const NoPassCrypto: PassCrypto = {
  generate: function (
    username: string,
    input: any
  ): Error | { secret: any; result: any } {
    return NoPassCryptoImpl.generate(username, input);
  },
  verify: function (username: string, secret: any, input: any): boolean {
    return NoPassCryptoImpl.verify(username, secret, input);
  },
};
