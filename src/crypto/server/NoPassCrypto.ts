import {
  PassCrypto,
  PassCryptoImpl,
  PassCryptoValidator,
} from './PassCryptoServerInterface';
import * as t from 'io-ts';

const NoPassCryptoValidator: PassCryptoValidator = {
  UserInputForGenerate: t.unknown,
  SecretData: t.unknown,
  UserResultOfGenerate: t.unknown,
  UserInputForVerify: t.unknown,
};

type NoPassCryptoUserInputForGenerate = {};
type NoPassCryptoSecretData = {};
type NoPassCryptoResultOfGenerate = {};
type NoPassCryptoUserInputForVerify = {};

export const NoPassCryptoImpl: PassCryptoImpl<
  NoPassCryptoUserInputForGenerate,
  NoPassCryptoSecretData,
  NoPassCryptoResultOfGenerate,
  NoPassCryptoUserInputForVerify
> = {
  validator: NoPassCryptoValidator,
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
