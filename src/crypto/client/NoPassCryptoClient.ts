import { InputViewConcept, OutputViewConcept } from '../../ui/FormConcept';
import {
  PassCryptoClientImpl,
  PassCryptoClientValidator,
} from './PassCryptoClientInterface';
import * as t from 'io-ts';

const NoPassCryptoValidator: PassCryptoClientValidator = {
  UserInputForGenerate: t.unknown,
  UserResultOfGenerate: t.unknown,
  UserInputForVerify: t.unknown,
};

type NoPassCryptoUserInputForGenerate = {};
type NoPassCryptoResultOfGenerate = {};
type NoPassCryptoUserInputForVerify = {};

export const NoPassCryptoClientImpl: PassCryptoClientImpl<
  NoPassCryptoUserInputForGenerate,
  NoPassCryptoResultOfGenerate,
  {}
> = {
  cryptoName: 'nopass',
  InputViewConceptForGenerate: function (): {
    [key: string]: InputViewConcept;
  } {
    return {};
  },
  OutputViewConceptForGenerate: function (): {
    [key: string]: OutputViewConcept;
  } {
    return {};
  },
  InputViewConceptForVerify: function (): { [key: string]: InputViewConcept } {
    return {};
  },
  validator: NoPassCryptoValidator,
  createUserInputForGenerate: function (
    username: string,
    userInput: { [key: string]: string }
  ): NoPassCryptoUserInputForGenerate {
    return {};
  },
  createResultOfGenerate: function (result: NoPassCryptoResultOfGenerate): {
    [key: string]: string;
  } {
    return {};
  },
  createUserInputForVerify: function (
    username: string,
    userInput: { [key: string]: string }
  ): NoPassCryptoUserInputForVerify {
    return {};
  },
};
