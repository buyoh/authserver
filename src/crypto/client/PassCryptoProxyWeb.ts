import { checkTypeVerbose } from '../../base/IoTs';
import { InputViewConcept, OutputViewConcept } from '../../ui/FormConcept';
import { NoPassCryptoClientImpl } from './NoPassCryptoClient';
import { OtpAuthCryptoClientImpl } from './OtpAuthCryptoClient';
import { PassCryptoClient } from './PassCryptoClientInterface';
import { SimplePassCryptoClientImpl } from './SimplePassCryptoClient';

type Impls =
  | typeof NoPassCryptoClientImpl
  | typeof OtpAuthCryptoClientImpl
  | typeof SimplePassCryptoClientImpl;

export class PassCryptoClientProxy implements PassCryptoClient {
  // bad name...
  crypto: Impls;

  // TODO: Refactorings
  constructor(cryptoName: string) {
    if (cryptoName === NoPassCryptoClientImpl.cryptoName) {
      this.crypto = NoPassCryptoClientImpl;
    } else if (cryptoName === OtpAuthCryptoClientImpl.cryptoName) {
      this.crypto = OtpAuthCryptoClientImpl;
    } else if (cryptoName === SimplePassCryptoClientImpl.cryptoName) {
      this.crypto = SimplePassCryptoClientImpl;
    } else {
      console.error('Internal Error: unknown crypto name:', cryptoName);
    }
  }
  cryptoName = '';

  InputViewConceptForGenerate(): { [key: string]: InputViewConcept } {
    return this.crypto.InputViewConceptForGenerate();
  }
  OutputViewConceptForGenerate(): { [key: string]: OutputViewConcept } {
    return this.crypto.OutputViewConceptForGenerate();
  }
  InputViewConceptForVerify(): { [key: string]: InputViewConcept } {
    return this.crypto.InputViewConceptForVerify();
  }

  createUserInputForGenerate(
    username: string,
    userInput: { [key: string]: string }
  ): object {
    return this.crypto.createUserInputForGenerate(username, userInput);
  }
  createResultOfGenerate(result: object): {
    [key: string]: string;
  } {
    if (checkTypeVerbose(this.crypto.validator.UserResultOfGenerate, result)) {
      console.warn('createUserInputForGenerate: checkType failed');
      // We do not need to abort... Only for debug
    }
    return this.crypto.createResultOfGenerate(result as any);
  }
  createUserInputForVerify(
    username: string,
    userInput: { [key: string]: string }
  ): object {
    return this.crypto.createUserInputForVerify(username, userInput);
  }
}
