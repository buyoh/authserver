import * as t from 'io-ts';

export interface PassCryptoImpl<
  UserInputForGenerate,
  SecretData,
  UserResultOfGenerate,
  UserInputForVerify
> {
  // cryptoName: string;  // TODO:
  /**
   * generate a salt for creating a new secret.
   */
  generate(
    username: string,
    input: UserInputForGenerate
  ): { secret: SecretData; result: UserResultOfGenerate } | Error;
  verify(
    username: string,
    secret: SecretData,
    input: UserInputForVerify
  ): boolean;
  validator: PassCryptoValidator;
}

// TODO: async
export interface PassCrypto {
  generate(
    username: string,
    input: object
  ): { secret: object; result: object } | Error;
  verify(username: string, secret: object, input: object): boolean;
}

export interface PassCryptoValidator {
  UserInputForGenerate: t.Any;
  SecretData: t.Any;
  UserResultOfGenerate: t.Any;
  UserInputForVerify: t.Any;
}
