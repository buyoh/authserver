import { InputViewConcept, OutputViewConcept } from '../ui/FormConcept';
import { PassCryptoClientImpl } from './PassCryptoClientInterface';

type SimplePassCryptoUserInputForGenerate = {
  pass?: string;
};
type SimplePassCryptoResultOfGenerate = {
  pass?: string;
};
type SimplePassCryptoUserInputForVerify = {
  pass: string;
};

export const SimplePassCryptoClientImpl: PassCryptoClientImpl<
  SimplePassCryptoUserInputForGenerate,
  SimplePassCryptoResultOfGenerate,
  {}
> = {
  cryptoName: 'pass',

  InputViewConceptForGenerate: function (): {
    [key: string]: InputViewConcept;
  } {
    return {
      pass: { type: 'password', priority: 1, minLength: 0, maxLength: 32 },
    };
  },

  OutputViewConceptForGenerate: function (): {
    [key: string]: OutputViewConcept;
  } {
    return {
      pass: { type: 'text', priority: 1 },
    };
  },

  InputViewConceptForVerify: function (): { [key: string]: InputViewConcept } {
    return {
      pass: { type: 'password', priority: 1, minLength: 4, maxLength: 32 },
    };
  },

  createUserInputForGenerate: function (
    username: string,
    userInput: { [key: string]: string }
  ): SimplePassCryptoUserInputForGenerate {
    // TODO: do salt
    return {
      pass: userInput.pass,
    };
  },

  createResultOfGenerate: function (result: SimplePassCryptoResultOfGenerate): {
    [key: string]: string;
  } {
    return {
      pass: result.pass,
    };
  },

  createUserInputForVerify: function (
    username: string,
    userInput: { [key: string]: string }
  ): SimplePassCryptoUserInputForVerify {
    // TODO: do salt
    return {
      pass: userInput.pass,
    };
  },
};
