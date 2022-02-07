/* eslint-disable @typescript-eslint/no-unused-vars */
import { PassCrypto, PassCryptoImpl } from './PassCryptoInterface';

type NoPassCryptoUserInputForGenerate = {};
type NoPassCryptoSecretData = {};
type NoPassCryptoResultOfGenerate = {};
type NoPassCryptoUserInputForVerify = {
  pass: string;
};

const NoPassCryptoImpl: PassCryptoImpl<
  NoPassCryptoUserInputForGenerate,
  NoPassCryptoSecretData,
  NoPassCryptoResultOfGenerate,
  NoPassCryptoUserInputForVerify
> = {
  generate(input: NoPassCryptoUserInputForGenerate):
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
    secret: NoPassCryptoSecretData,
    input: NoPassCryptoUserInputForVerify
  ): boolean {
    return true;
  },
};

// any にしてしまったら意味が無い…
// ただクライアントとやりとりする間に型は失うので、どこまで型を引っ張るかは検討
export const NoPassCrypto: PassCrypto = {
  generate: function (input: any): Error | { secret: any; result: any } {
    return NoPassCryptoImpl.generate(input);
  },
  verify: function (secret: any, input: any): boolean {
    return NoPassCryptoImpl.verify(secret, input);
  },
};
