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

// TODO: async
// TODO: userInputForGenerate に username などの情報を取り込みたいことは想定される設計だが、
// どのタイミングで取り込むべき？引数や interface として User の枠を用意すべき？
export interface PassCrypto {
  generate(input: object): { secret: object; result: object } | Error;
  verify(secret: object, input: object): boolean;
}
