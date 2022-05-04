import React from 'react';
import { PassCryptoMode } from '../../../crypto/PassCrypto';
import { PassCryptoClient } from '../../../crypto/PassCryptoProxyWeb';
import { sortedViewConceptsInternal } from '../../../ui/FormConcept';
import OutputViewsConcreteForm from './OutputViewsConcreteForm';

type Props = {
  mode: PassCryptoMode;
  result: object;
};

type State = {};

class CreateUserResult extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    const client = new PassCryptoClient(this.props.mode);
    const concepts = sortedViewConceptsInternal(
      client.OutputViewConceptForGenerate()
    );
    const values = client.createResultOfGenerate(this.props.result);
    return (
      <div>
        <OutputViewsConcreteForm concepts={concepts} values={values} />
      </div>
    );
  }
}

export default CreateUserResult;
