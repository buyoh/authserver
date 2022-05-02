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
}

// TODO: async
// TODO: userInputForGenerate に username などの情報を取り込みたいことは想定される設計だが、
// どのタイミングで取り込むべき？引数や interface として User の枠を用意すべき？
export interface PassCrypto {
  generate(
    username: string,
    input: object
  ): { secret: object; result: object } | Error;
  verify(username: string, secret: object, input: object): boolean;
}
