import React from 'react';
import { OutputViewConceptWithKey } from '../../../ui/FormConcept';
import QRCode from './QRCode';

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
    return (
      <div className="table-row">
        <div className="table-cell">{this.props.concept.key}</div>
        <div className="table-cell">{this.renderValue()}</div>
      </div>
    );
  }

  renderValue(): JSX.Element {
    if (this.props.concept.type === 'qr') {
      return this.renderQr();
    } else {
      // text
      return this.renderText();
    }
  }
  renderQr(): JSX.Element {
    return (
      <span style={{ display: 'inline-block', border: '10px solid #fff' }}>
        <QRCode
          size={128}
          cssWidth={256}
          cssHeight={256}
          value={this.props.value}
        />
      </span>
    );
  }

  renderText(): JSX.Element {
    return <code>{this.props.value}</code>;
  }
}

export default OutputViewConcrete;
