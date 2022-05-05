import { InputViewConcept, OutputViewConcept } from '../../ui/FormConcept';
import { PassCryptoClientImpl } from './PassCryptoClientInterface';

type OtpAuthCryptoUserInputForGenerate = {};
type OtpAuthCryptoResultOfGenerate = {
  otpauth_url: string;
};
type OtpAuthCryptoUserInputForVerify = {
  pass: string;
};

export const OtpAuthCryptoClientImpl: PassCryptoClientImpl<
  OtpAuthCryptoUserInputForGenerate,
  OtpAuthCryptoResultOfGenerate,
  {}
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
