import React from 'react';
import Styles from './style.module.scss';

type Props = {
  value: string;
  onChange: (text: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  password?: boolean;
  style?: ReadonlyArray<'special' | 'large'>;
};

type State = {};

class TextInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  getClassNames() {
    const className = [Styles.textInput];
    if (this.props.style)
      className.push(...this.props.style.map((k) => Styles[k]));
    return className;
  }

  render(): JSX.Element {
    const type = this.props.password ? 'password' : 'text';
    return (
      <input
        type={type}
        className={this.getClassNames().join(' ')}
        placeholder={this.props.placeholder}
        value={this.props.value}
        onChange={(e) => this.props.onChange(e.target.value, e)}
        spellCheck={false}
        required={this.props.required}
        autoComplete="off"
        autoCapitalize="off"
      />
    );
  }
}

export default TextInput;
