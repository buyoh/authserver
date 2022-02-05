// NOTE: このコードについて
// PassCrypto は以下のような設計にするつもりだった。公開鍵のようなもの。
// やる気があれば、こちらの設計で再実装するかもしれない。

export interface PassCryptoImplWithSalt<
  SessionDataForGenerate,
  ClientDataForGenerate,
  UserInputForGenerate,
  SecretData,
  UserResultOfGenerate,
  SessionDataForVerify,
  ClientDataForVerify,
  UserInputForVerify
> {
  // TODO: この設計は複数ウィンドウを開いた状態でのログインがおかしくなる？
  // win1を開く→begin→sessionを記録してclientをwin1へ渡す
  // win2を開く→begin→sessionを記録するが、win1のsessionを上書きする。
  // セッションが保持されているのであれば、生成済みのものを渡すようにすることで解決する。
  // なぜなら、上書きは無くなるため。
  /**
   * generate a salt for creating a new secret.
   * サーバはクライアントに client を渡す。
   * クライアントは client とユーザが入力した情報を基に UserInputForGenerate を生成する。
   * UserInputForGenerate は generate で使用する。
   */
  beginToGenerate():
    | { session: SessionDataForGenerate; client: ClientDataForGenerate }
    | Error;
  /**
   * generate a salt for creating a new secret.
   */
  generate(
    session: SessionDataForGenerate,
    client: ClientDataForGenerate,
    input: UserInputForGenerate
  ): { secret: SecretData; result: UserResultOfGenerate } | Error;
  /**
   * generate a salt for creating a new secret.
   */
  beginToVerify():
    | { session: SessionDataForVerify; client: ClientDataForVerify }
    | Error;
  verify(
    secret: SecretData,
    session: SessionDataForVerify,
    client: ClientDataForVerify,
    input: UserInputForVerify
  ): boolean;
}

export interface PassCryptoWithSalt {
  beginToGenerate(): { session: object; client: object } | Error;
  generate(
    session: object,
    client: object,
    input: object
  ): { secret: object; result: object } | Error;
  beginToVerify(): { session: object; client: object } | Error;
  verify(
    secret: object,
    session: object,
    client: object,
    input: object
  ): boolean;
}
