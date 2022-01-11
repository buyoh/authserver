/**
 * @template PubSalt クライアントで暗号化する場合に、クライアントに渡す塩
 * @template PrivSalt クライアントで暗号化する場合に、サーバ内で秘匿する塩
 * @template ReqGen 暗号化対象・ユーザの生の識別情報
 * @template ResGen 認証に利用する外部に公開する情報
 * @template Secret 認証に利用する内部で秘匿する情報
 * @template Pass ユーザが認証時に入力する情報。パスワードなど。
 */
export interface PassCryptoWithSalt<
  PubSalt,
  PrivSalt,
  ReqGen,
  ResGen,
  Secret,
  Pass
> {
  generateSalt(): [PubSalt, PrivSalt];
  generateKey(
    reqGen: ReqGen,
    pubSalt?: PubSalt,
    privSalt?: PrivSalt
  ): [ResGen, Secret];
  verify(
    pass: Pass,
    secret: Secret,
    pubSalt?: PubSalt,
    privSalt?: PrivSalt
  ): boolean;
}
export interface PassCryptoWithoutSalt<ReqGen, ResGen, Secret, Pass> {
  generateKey(reqGen: ReqGen): [ResGen, Secret];
  verify(pass: Pass, secret: Secret): boolean;
}
