export interface PassCryptoImpl<
  SessionDataForGenerate,
  ClientDataForGenerate,
  UserInputForGenerate,
  SecretData,
  UserResultOfGenerate,
  SessionDataForVerify,
  ClientDataForVerify,
  UserInputForVerify
> {
  beginToGenerate():
    | { session: SessionDataForGenerate; client: ClientDataForGenerate }
    | Error;
  generate(
    session: SessionDataForGenerate,
    client: ClientDataForGenerate,
    input: UserInputForGenerate
  ): { secret: SecretData; result: UserResultOfGenerate } | Error;
  beginToVerify(
    secret: SecretData
  ): { session: SessionDataForVerify; client: ClientDataForVerify } | Error;
  verify(
    secret: SecretData,
    session: SessionDataForVerify,
    client: SessionDataForVerify,
    input: UserInputForVerify
  ): boolean;
}

export interface PassCrypto {
  beginToGenerate(): { session: any; client: any } | Error;
  generate(
    session: any,
    client: any,
    input: any
  ): { secret: any; result: any } | Error;
  beginToVerify(secret: any): { session: any; client: any } | Error;
  verify(secret: any, session: any, client: any, input: any): boolean;
}
