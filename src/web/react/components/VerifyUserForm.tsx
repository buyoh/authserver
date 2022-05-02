import React from 'react';
import {
  PassCryptoClient,
  PassCryptoMode,
} from '../../../crypto/PassCryptoProxyWeb';
import { sortedViewConceptsInternal } from '../../../ui/FormConcept';
import InputViewsConcreteForm from './InputViewsConcreteForm';
import TextInput from './TextInput';

type Props = {
  mode: PassCryptoMode;
  username: string;
  onSubmit: (generated: object) => void;
};

// lifting state up is not needed.
type State = {};

class VerifyUserForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { username: '' };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  private handleSubmit(value: { [key: string]: string }) {
    let generated = new PassCryptoClient(
      this.props.mode
    ).createUserInputForVerify(this.props.username, value);
    this.props.onSubmit(generated);
  }

  render(): JSX.Element {
    const client = new PassCryptoClient(this.props.mode);
    const concepts = sortedViewConceptsInternal(
      client.InputViewConceptForVerify()
    );
    return (
      <div>
        <InputViewsConcreteForm
          concepts={concepts}
          conceptsKey={this.props.mode}
          onSubmit={this.handleSubmit}
          submitLabel={'login'}
          largeStyle={true}
        />
      </div>
    );
  }
}

export default VerifyUserForm;
