import React from 'react';
import { PassCryptoMode } from '../../../crypto/PassCrypto';
import { PassCryptoClient } from '../../../crypto/PassCryptoProxyWeb';
import { sortedViewConceptsInternal } from '../../../ui/FormConcept';
import InputViewsConcreteForm from './InputViewsConcreteForm';

type Props = {
  mode: PassCryptoMode;
  username: string;
  onSubmit: (generated: object) => void;
};

type State = {};

class CreateUserForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  private handleSubmit(value: { [key: string]: string }) {
    let generated = new PassCryptoClient(
      this.props.mode
    ).createUserInputForGenerate(this.props.username, value);
    this.props.onSubmit(generated);
  }

  render(): JSX.Element {
    const client = new PassCryptoClient(this.props.mode);
    const concepts = sortedViewConceptsInternal(
      client.InputViewConceptForGenerate()
    );
    return (
      <InputViewsConcreteForm
        concepts={concepts}
        conceptsKey={this.props.mode}
        onSubmit={this.handleSubmit}
      />
    );
  }
}

export default CreateUserForm;
