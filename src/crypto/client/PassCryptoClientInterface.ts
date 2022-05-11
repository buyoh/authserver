import { InputViewConcept, OutputViewConcept } from '../../ui/FormConcept';
import * as t from 'io-ts';

//
// Define what the frontend do
//

export interface PassCryptoClient {
  cryptoName: string;
  InputViewConceptForGenerate(): { [key: string]: InputViewConcept };
  OutputViewConceptForGenerate(): { [key: string]: OutputViewConcept };
  InputViewConceptForVerify(): { [key: string]: InputViewConcept };

  createUserInputForGenerate(
    username: string,
    userInput: { [key: string]: string }
  ): object;
  createResultOfGenerate(result: object): {
    [key: string]: string;
  };
  createUserInputForVerify(
    username: string,
    userInput: { [key: string]: string }
  ): object;
}

export interface PassCryptoClientImpl<
  UserInputForGenerate,
  ResultOfGenerate,
  UserInputForVerify
> {
  cryptoName: string;
  InputViewConceptForGenerate(): { [key: string]: InputViewConcept };
  OutputViewConceptForGenerate(): { [key: string]: OutputViewConcept };
  InputViewConceptForVerify(): { [key: string]: InputViewConcept };

  validator: PassCryptoClientValidator;
  createUserInputForGenerate(
    username: string,
    userInput: { [key: string]: string }
  ): UserInputForGenerate;
  createResultOfGenerate(result: ResultOfGenerate): {
    [key: string]: string;
  };
  createUserInputForVerify(
    username: string,
    userInput: { [key: string]: string }
  ): UserInputForVerify;
}

export interface PassCryptoClientValidator {
  UserInputForGenerate: t.Any;
  UserResultOfGenerate: t.Any;
  UserInputForVerify: t.Any;
}
