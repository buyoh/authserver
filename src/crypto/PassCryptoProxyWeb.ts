import { InputViewConcept, OutputViewConcept } from '../ui/FormConcept';
import { NoPassCryptoClientImpl } from './NoPassCryptoClient';
import { OtpAuthCryptoClientImpl } from './OtpAuthCryptoClient';
import { PassCryptoClientImpl } from './PassCryptoClientInterface';
import { SimplePassCryptoClientImpl } from './SimplePassCryptoClient';

type Impls =
  | typeof NoPassCryptoClientImpl
  | typeof OtpAuthCryptoClientImpl
  | typeof SimplePassCryptoClientImpl;

export class PassCryptoClient
  implements PassCryptoClientImpl<object, object, object>
{
  // bad name...
  crypto: Impls;

  // TODO: Refactorings
  // サーバ側のように、実装ごとに用意した方が良いかもしれない
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
    // TODO: consider checking type
    return this.crypto.createUserInputForGenerate(username, userInput);
  }
  createResultOfGenerate(result: object): {
    [key: string]: string;
  } {
    // TODO: consider checking type
    return this.crypto.createResultOfGenerate(result as any);
  }
  createUserInputForVerify(
    username: string,
    userInput: { [key: string]: string }
  ): object {
    // TODO: consider checking type
    return this.crypto.createUserInputForVerify(username, userInput);
  }
}
