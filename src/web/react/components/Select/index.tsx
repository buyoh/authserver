import React from 'react';
import Styles from './style.module.scss';

interface Option {
  key?: string;
  label: string;
  value: string;
}

type Props = {
  value: string;
  options: Option[];
  onChange: (val: string, e: React.ChangeEvent<HTMLSelectElement>) => void;
  style?: ReadonlyArray<'large'>;
};

type State = {};

class Select extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  getClassNames() {
    const className = [Styles.select];
    if (this.props.style)
      className.push(...this.props.style.map((k) => Styles[k]));
    return className;
  }

  render(): JSX.Element {
    return (
      <select
        className={this.getClassNames().join(' ')}
        value={this.props.value}
        onChange={(e) => this.props.onChange(e.target.value, e)}
      >
        {this.props.options.map((e) => (
          <option key={e.key ?? e.label} value={e.value}>
            {e.label}
          </option>
        ))}
      </select>
    );
  }
}

export default Select;
