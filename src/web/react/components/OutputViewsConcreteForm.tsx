import React from 'react';
import { OutputViewConceptWithKey } from '../../../ui/FormConcept';
import OutputViewConcrete from './OutputViewConcrete';

type Props = {
  concepts: OutputViewConceptWithKey[];
  values: { [key: string]: string }; // will not change so frequentcy
};

type State = {};

class OutputViewsConcreteForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render(): JSX.Element {
    return (
      <div className="table">
        {this.props.concepts.map((c) => (
          <OutputViewConcrete
            concept={c}
            key={c.key}
            value={this.props.values[c.key]}
          />
        ))}
      </div>
    );
  }
}

export default OutputViewsConcreteForm;
