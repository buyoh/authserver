import React from 'react';
import { InputViewConceptWithKey } from '../../../ui/FormConcept';
import TextInput from './TextInput';

type Props = {
  concept: InputViewConceptWithKey;
  value: string;
  onChange: (value: string) => void;
  largeStyle?: boolean;
};

type State = {};

class InputViewConcrete extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    const type = this.props.concept.type;
    return type === 'password' ? this.renderPassword() : this.renderText();
  }

  renderText(): JSX.Element {
    const style = (this.props.largeStyle ? ['large'] : []) as 'large'[];
    return (
      <TextInput
        placeholder={this.props.concept.key}
        value={this.props.value}
        onChange={this.props.onChange}
        style={style}
      />
    );
  }

  renderPassword(): JSX.Element {
    const style = (this.props.largeStyle ? ['large'] : []) as 'large'[];
    return (
      <TextInput
        value={this.props.value}
        onChange={this.props.onChange}
        placeholder={this.props.concept.key}
        password={true}
        style={style}
      />
    );
  }
}

export default InputViewConcrete;
