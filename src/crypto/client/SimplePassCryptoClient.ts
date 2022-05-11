import { InputViewConcept, OutputViewConcept } from '../../ui/FormConcept';
import {
  PassCryptoClientImpl,
  PassCryptoClientValidator,
} from './PassCryptoClientInterface';
import * as t from 'io-ts';

const SimplePassCryptoValidator: PassCryptoClientValidator = {
  UserInputForGenerate: t.type({
    pass: t.union([t.string, t.undefined]),
  }),
  UserResultOfGenerate: t.type({
    pass: t.union([t.string, t.undefined]),
  }),
  UserInputForVerify: t.type({
    pass: t.string,
  }),
};

type SimplePassCryptoUserInputForGenerate = t.TypeOf<
  typeof SimplePassCryptoValidator.UserInputForGenerate
>;
type SimplePassCryptoResultOfGenerate = t.TypeOf<
  typeof SimplePassCryptoValidator.UserResultOfGenerate
>;
type SimplePassCryptoUserInputForVerify = t.TypeOf<
  typeof SimplePassCryptoValidator.UserInputForVerify
>;

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

  validator: SimplePassCryptoValidator,

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
