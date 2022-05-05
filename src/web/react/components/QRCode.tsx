import React from 'react';

import { QRCodeCanvas } from 'qrcode.react';
type Props = {
  size: number;
  cssWidth: number;
  cssHeight: number;
  value: string;
};

type State = {};

class QRCode extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <QRCodeCanvas
        size={this.props.size}
        imageSettings={{
          src: 'about:blank',
          width: this.props.cssWidth,
          height: this.props.cssHeight,
          excavate: false,
        }}
        value={this.props.value}
      />
    );
  }
}

export default QRCode;
