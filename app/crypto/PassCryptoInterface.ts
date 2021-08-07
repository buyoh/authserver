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
