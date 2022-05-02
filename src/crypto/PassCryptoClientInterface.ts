//
// Define what the frontend do
//

import { InputViewConcept, OutputViewConcept } from '../ui/FormConcept';

export interface PassCryptoClientImpl<
  UserInputForGenerate,
  ResultOfGenerate,
  UserInputForVerify
> {
  cryptoName: string;
  InputViewConceptForGenerate(): { [key: string]: InputViewConcept };
  OutputViewConceptForGenerate(): { [key: string]: OutputViewConcept };
  InputViewConceptForVerify(): { [key: string]: InputViewConcept };

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
