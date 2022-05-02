import React from 'react';
import { OutputViewConceptWithKey } from '../../../ui/FormConcept';

type Props = {
  concept: OutputViewConceptWithKey;
  value: string;
};

type State = {};

class OutputViewConcrete extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    // const type = this.props.concept.type; // TODO:
    return this.renderText();
  }

  renderText(): JSX.Element {
    return (
      <div>
        <label>
          {this.props.concept.key}
          <output>{this.props.value}</output>
        </label>
      </div>
    );
  }
}

export default OutputViewConcrete;
