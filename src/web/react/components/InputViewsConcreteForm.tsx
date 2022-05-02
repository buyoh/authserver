import React from 'react';
import { InputViewConceptWithKey } from '../../../ui/FormConcept';
import InputViewConcrete from './InputViewConcrete';
import Button from './Button';

type Props = {
  concepts: InputViewConceptWithKey[];
  // To identify concepts
  conceptsKey: string;
  onSubmit: (value: { [key: string]: string }) => void;
  submitLabel?: string;
  largeStyle?: boolean;
};

// lifting state up is not needed.
// 各 concepts の key ごとに、State は _value_""#"keys" の状態を持つ。
type State = {
  [key: string]: string;
};

class InputViewsConcreteForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = Object.fromEntries(
      props.concepts.map((c) => [
        '_value_' + props.conceptsKey + '#' + c.key,
        '',
      ])
    );
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  private handleSubmit() {
    this.props.onSubmit(
      Object.fromEntries(
        this.props.concepts.map((c) => [
          c.key,
          this.state['_value_' + this.props.conceptsKey + '#' + c.key] ?? '',
        ])
      )
    );
  }

  private handleChange(key: string, value: string) {
    const s = { ...this.state };
    s['_value_' + this.props.conceptsKey + '#' + key] = value;
    this.setState(s);
  }

  render(): JSX.Element {
    const style = (this.props.largeStyle ? ['large'] : []) as 'large'[];
    return (
      <>
        {this.props.concepts.map((c) => (
          <InputViewConcrete
            concept={c}
            key={c.key}
            value={
              this.state['_value_' + this.props.conceptsKey + '#' + c.key] ?? ''
            }
            onChange={(val) => this.handleChange(c.key, val)}
            largeStyle={this.props.largeStyle}
          />
        ))}
        <div className="spaced-block">
          <Button
            onClick={this.handleSubmit}
            style={['special'].concat(style) as ('large' | 'special')[]}
          >
            {this.props.submitLabel ?? 'submit'}
          </Button>
        </div>
      </>
    );
  }
}

export default InputViewsConcreteForm;
