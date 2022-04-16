import React from 'react';
import Styles from './style.module.scss';

type Props = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  submit?: boolean;
  style?: ReadonlyArray<'special' | 'large'>;
  children?: React.ReactNode;
};

type State = {};

class Button extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  getClassNames() {
    const className = [Styles.button];
    if (this.props.style)
      className.push(...this.props.style.map((k) => Styles[k]));
    return className;
  }

  render(): JSX.Element {
    const type = this.props.submit ? 'submit' : 'button';
    return (
      <button
        className={this.getClassNames().join(' ')}
        type={type}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    );
  }
}

export default Button;
