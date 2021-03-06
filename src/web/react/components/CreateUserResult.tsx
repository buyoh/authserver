import React from 'react';
import { PassCryptoMode } from '../../../crypto/PassCrypto';
import { PassCryptoClientProxy } from '../../../crypto/client/PassCryptoProxyWeb';
import { sortedViewConceptsInternal } from '../../../ui/FormConcept';
import OutputViewsConcreteForm from './OutputViewsConcreteForm';

type Props = {
  mode: PassCryptoMode;
  result?: object;
};

type State = {};

class CreateUserResult extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    const client = new PassCryptoClientProxy(this.props.mode);
    const concepts = sortedViewConceptsInternal(
      client.OutputViewConceptForGenerate()
    );
    if (!this.props.result) {
      return <></>;
    }
    const values = client.createResultOfGenerate(this.props.result);
    return <OutputViewsConcreteForm concepts={concepts} values={values} />;
  }
}

export default CreateUserResult;
