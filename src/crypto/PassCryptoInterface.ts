export interface PassCryptoImpl<
  UserInputForGenerate,
  SecretData,
  UserResultOfGenerate,
  UserInputForVerify
> {
  /**
   * generate a salt for creating a new secret.
   */
  generate(
    input: UserInputForGenerate
  ): { secret: SecretData; result: UserResultOfGenerate } | Error;
  verify(secret: SecretData, input: UserInputForVerify): boolean;
}

export interface PassCrypto {
  generate(input: object): { secret: object; result: object } | Error;
  verify(secret: object, input: object): boolean;
}
