// import { PassCrypto, PassCryptoImpl } from './PassCryptoInterface';

// // 動作確認用。暗号化は行わない。

// type SimplePlainTextCryptoSessionDataForGenerate = {
//   session: string;
// };
// type SimplePlainTextCryptoClientDataForGenerate = {
//   client: string;
// };
// type SimplePlainTextCryptoUserInputForGenerate = {
//   username: string;
//   pass: string;
// };
// type SimplePlainTextCryptoSecretData = {
//   secret: string;
// };
// type SimplePlainTextCryptoResultOfGenerate = {
//   otpauth_url: string;
// };
// type SimplePlainTextCryptoSessionDataForVerify = {};
// type SimplePlainTextCryptoClientDataForVerify = {};
// type SimplePlainTextCryptoUserInputForVerify = {
//   pass: string;
// };

// const SimplePlainTextCryptoImpl: PassCryptoImpl<
//   SimplePlainTextCryptoSessionDataForGenerate,
//   SimplePlainTextCryptoClientDataForGenerate,
//   SimplePlainTextCryptoUserInputForGenerate,
//   SimplePlainTextCryptoSecretData,
//   SimplePlainTextCryptoResultOfGenerate,
//   SimplePlainTextCryptoSessionDataForVerify,
//   SimplePlainTextCryptoClientDataForVerify,
//   SimplePlainTextCryptoUserInputForVerify
// > = {
//   beginToGenerate():
//     | {
//         session: SimplePlainTextCryptoSessionDataForGenerate;
//         client: SimplePlainTextCryptoClientDataForGenerate;
//       }
//     | Error {
//     return { session: {}, client: {} };
//   },
//   generate(
//     session: SimplePlainTextCryptoSessionDataForGenerate,
//     client: SimplePlainTextCryptoClientDataForGenerate,
//     input: SimplePlainTextCryptoUserInputForGenerate
//   ):
//     | {
//         secret: SimplePlainTextCryptoSecretData;
//         result: SimplePlainTextCryptoResultOfGenerate;
//       }
//     | Error {
//     const secret = Speakeasy.generateSecret({
//       length: 32,
//       name: crypto.randomUUID() + ':' + input.username,
//     });
//     return {
//       secret: { secret: secret.base32 },
//       result: { otpauth_url: secret.otpauth_url },
//     };
//   },
//   beginToVerify():
//     | {
//         session: SimplePlainTextCryptoSessionDataForVerify;
//         client: SimplePlainTextCryptoClientDataForVerify;
//       }
//     | Error {
//     throw new Error('Method not implemented.');
//   },
//   verify(
//     secret: SimplePlainTextCryptoSecretData,
//     session: SimplePlainTextCryptoSessionDataForVerify,
//     client: SimplePlainTextCryptoClientDataForVerify,
//     input: SimplePlainTextCryptoUserInputForVerify
//   ): boolean {
//     return Speakeasy.totp.verify({
//       secret: secret.secret,
//       encoding: 'base32',
//       token: input.pass,
//     });
//   },
// };

// // any にしてしまったら意味が無い…
// // ただクライアントとやりとりする間に型は失うので、どこまで型を引っ張るかは検討
// export const SimplePlainTextCrypto: PassCrypto = {
//   beginToGenerate: function (): Error | { session: any; client: any } {
//     return SimplePlainTextCryptoImpl.beginToGenerate();
//   },
//   generate: function (
//     session: any,
//     client: any,
//     input: any
//   ): Error | { secret: any; result: any } {
//     const { username } = input;
//     if (typeof username !== 'string') return new Error();
//     const newInput = { username };
//     return SimplePlainTextCryptoImpl.generate({}, {}, newInput);
//   },
//   beginToVerify: function (secret: any): Error | { session: any; client: any } {
//     return SimplePlainTextCryptoImpl.beginToVerify(secret);
//   },
//   verify: function (
//     secret: any,
//     session: any,
//     client: any,
//     input: any
//   ): boolean {
//     // TODO: validate
//     return SimplePlainTextCryptoImpl.verify(secret, session, client, input);
//   },
// };
