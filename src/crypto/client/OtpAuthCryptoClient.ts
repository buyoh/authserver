import { InputViewConcept, OutputViewConcept } from '../../ui/FormConcept';
import {
  PassCryptoClientImpl,
  PassCryptoClientValidator,
} from './PassCryptoClientInterface';
import * as t from 'io-ts';

const OtpAuthCryptoValidator: PassCryptoClientValidator = {
  UserInputForGenerate: t.type({}),
  UserResultOfGenerate: t.type({
    otpauth_url: t.string,
  }),
  UserInputForVerify: t.type({
    pass: t.string,
  }),
};

type OtpAuthCryptoUserInputForGenerate = t.TypeOf<
  typeof OtpAuthCryptoValidator.UserInputForGenerate
>;
type OtpAuthCryptoResultOfGenerate = t.TypeOf<
  typeof OtpAuthCryptoValidator.UserResultOfGenerate
>;
type OtpAuthCryptoUserInputForVerify = t.TypeOf<
  typeof OtpAuthCryptoValidator.UserInputForVerify
>;

export const OtpAuthCryptoClientImpl: PassCryptoClientImpl<
  OtpAuthCryptoUserInputForGenerate,
  OtpAuthCryptoResultOfGenerate,
  OtpAuthCryptoUserInputForVerify
> = {
  cryptoName: 'otpauth',
  InputViewConceptForGenerate: function (): {
    [key: string]: InputViewConcept;
  } {
    return {};
  },
  OutputViewConceptForGenerate: function (): {
    [key: string]: OutputViewConcept;
  } {
    return { otpauth_url: { type: 'qr', priority: 1 } };
  },
  InputViewConceptForVerify: function (): { [key: string]: InputViewConcept } {
    return { pass: { type: 'text', priority: 1, minLength: 4, maxLength: 32 } };
  },
  validator: OtpAuthCryptoValidator,
  createUserInputForGenerate: function (
    username: string,
    userInput: { [key: string]: string }
  ): OtpAuthCryptoUserInputForGenerate {
    return {};
  },
  createResultOfGenerate: function (result: OtpAuthCryptoResultOfGenerate): {
    [key: string]: string;
  } {
    return { otpauth_url: result.otpauth_url };
  },
  createUserInputForVerify: function (
    username: string,
    userInput: { [key: string]: string }
  ): OtpAuthCryptoUserInputForVerify {
    return { pass: userInput.pass };
  },
};
